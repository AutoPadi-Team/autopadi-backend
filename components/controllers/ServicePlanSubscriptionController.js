const ServicePlanSubscription = require("../models/ServicePlanSubscriptionModel");
const User = require("../models/usersModel");
const smsInfo = require("../smsSender/smsInfo");
const api = require("../axiosApi/api");

// Subscribe to a service plan
exports.subscribeToServicePlan = async (req, res) => {
  try {
    const {
      driverId,
      mechanicId,
      packageId,
      subscriptionType,
      subscriptionAmount
    } = req.body;

    if (!driverId || !mechanicId || !subscriptionType || !subscriptionAmount || !packageId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing active subscription
    const existingSubscription = await ServicePlanSubscription.findOne({
      driverId,
      mechanicId,
      subscriptionStatus: true,
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: `You already have an active subscription for ${existingSubscription.subscriptionType}.`,
      });
    }

    // check for existing driver
    const driver = await User.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Initialize Paystack transaction
    const response = await api.post(
      "transaction/initialize",
      {
        amount: subscriptionAmount * 100, // Convert to kobo
        email: driver.email,
        metadata: {
          custom_fields: [
            {
              variable_name: "driver_id",
              value: driverId,
            },
            {
              variable_name: "mechanic_id",
              value: mechanicId,
            },
            {
              variable_name: "package_id",
              value: packageId,
            },
            {
              variable_name: "subscription_type",
              value: subscriptionType,
            },
            {
              variable_name: "payment_model",
              value: "new-service-plan-subscription",
            },
          ]
        }
      }
    );
    // Deconstruct response data
    const { status, message, data } = response.data;

    res.status(201).json({
      success: status,
      message: message,
      authorization_url: data.authorization_url,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};


// Renew a subscription
exports.renewSubscription = async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await ServicePlanSubscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      if (subscription.subscriptionStatus === false) {
        return res
          .status(404)
          .json({ message: "Cannot renew a cancelled subscription" });
      }

      // Check for existing driver
      const driver = await User.findById(subscription.driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Initialize Paystack transaction
      const response = await api.post(
        "transaction/initialize",
        {
          amount: subscription.subscriptionAmount * 100, // Convert to kobo
          email: driver.email,
          metadata: {
            custom_fields: [
              {
                variable_name: "subscription_id",
                value: subscription._id,
              },
              {
                variable_name: "payment_model",
                value: "renew-service-plan-subscription",
              },
            ],
          },
        },
      );
      // Deconstruct response data
      const { status, message, data } = response.data;

      res.status(201).json({
        success: status,
        message: message,
        authorization_url: data.authorization_url,
      });
    } catch (err) {
        res.status(500).json({ 
          message: `Server error: ${err.message}` 
        });
    }
};

// Get subscriptions for a user
exports.getUserSubscriptions = async (req, res) => {
  try {
    const { driverId, mechanicId } = req.params;
    const subscriptions = await ServicePlanSubscription.find({
      $and: [{ driverId }, { mechanicId }, { subscriptionStatus: true }],
    }).populate("driverId", "fullName email")
      .populate("mechanicId", "fullName email")
      .populate("packageId", "benefits bonuses terms");

      if (subscriptions.length === 0) {
        return res.status(404).json({ message: "No active subscriptions found" });
      }
    res.status(200).json({
        message: "Service plan subscription retrieved successfully",
        subscriptions,
      });
    } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

// Cancel a subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await ServicePlanSubscription.findById(id);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        if (subscription.subscriptionStatus === false) {
            return res.status(404).json({ message: "Subscription already cancelled" });
        }
        subscription.subscriptionStatus = false;
        await subscription.save();

        // Send SMS notification to driver
        const driver = await User.findById(subscription.driverId);
        const mechanic = await User.findById(subscription.mechanicId);
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${driver.fullName}, we're sorry to see you go. Your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} has been cancelled.`,
        });

        res.status(200).json({ message: "Subscription cancelled successfully", subscription: subscription.subscriptionStatus });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

// Get all subscriptions (admin)
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await ServicePlanSubscription.find()
            .populate("driverId", "fullName email")
            .populate("mechanicId", "fullName email")
            .populate("packageId", "benefits bonuses terms");
        res.status(200).json({ message: "Service plan subscription retrieved successfully", subscriptions });
    }
    catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

// update service plan subscription maintenance task status
exports.updateMaintenanceTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await ServicePlanSubscription.findByIdAndUpdate(
          id,
          { maintenanceTask: "completed" },
          { new: true }
        );
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        res.status(200).json({ message: "Maintenance task status updated successfully", subscription });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};