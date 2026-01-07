const ServicePlanSubscription = require("../models/ServicePlanSubscriptionModel");
const ServicePlanPayment = require("../models/servicePlanPaymentModel");
const User = require("../models/usersModel");
const smsInfo = require("../smsSender/smsInfo");

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
        message:
          `You already have an active subscription for ${existingSubscription.subscriptionType}.`,
      });
    }

    const start = new Date(Date.now());
    const stopDate = new Date(Date.now() + 30*24*60*60*1000); // 30 days from now
    const newSubscription = new ServicePlanSubscription({
      driverId,
      mechanicId,
      packageId,
      subscriptionType,
      subscriptionAmount,
      subscriptionStatus: true,
      startDate: start,
      endDate: stopDate,
    });
    const savedSubscription = await newSubscription.save();

    // Create payment record
    const servicePlanPayment = new ServicePlanPayment({
      subscriptionId: savedSubscription._id,
      driverId: savedSubscription.driverId,
      mechanicId: savedSubscription.mechanicId,
      subscriptionAmount: savedSubscription.subscriptionAmount,
    });
    const savedPayment = await servicePlanPayment.save();

    // Send SMS notifications to driver and mechanic
    const driver = await User.findById(savedSubscription.driverId);
    const mechanic = await User.findById(savedSubscription.mechanicId);
    await smsInfo({
      phoneNumber: driver.phoneNumber,
      msg: `Dear ${driver.fullName}, you've successfully subscribed to ${mechanic.fullName}'s ${savedSubscription.subscriptionType} with AutoPadi.\nStart Date: ${savedSubscription.startDate.toDateString()}\nEnd Date: ${savedSubscription.endDate.toDateString()}`,
    });
    await smsInfo({
      phoneNumber: mechanic.phoneNumber,
      msg: `Dear ${mechanic.fullName}, your customer ${driver.fullName} has subscribed to your ${savedSubscription.subscriptionType} with AutoPadi. `,
    });

    res.status(201).json({
      message: "Service plan subscription created successfully",
      subscription: savedSubscription,
      payment: savedPayment.subscriptionAmount,
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
        return res.status(404).json({ message: "Cannot renew a cancelled subscription" });
      }

      const daysLeft = Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`Days left: ${daysLeft}`);
      
      if (daysLeft <= 7) {
        return res.status(400).json({ message: `Subscription is still active with ${daysLeft} day(s) left` });
      }

      const newEndDate = new Date(
        subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000
      ); // Extend by 30 days
      subscription.endDate = newEndDate;
      subscription.subscriptionStatus = true;
      await subscription.save();

      // Create payment record for renewal
      const servicePlanPayment = new ServicePlanPayment({
        subscriptionId: subscription._id,
        driverId: subscription.driverId,
        mechanicId: subscription.mechanicId,
        subscriptionAmount: subscription.subscriptionAmount,
      });
      await servicePlanPayment.save();

      // Send SMS notification to driver
      const driver = await User.findById(subscription.driverId);
      const mechanic = await User.findById(subscription.mechanicId);
      await smsInfo({
        phoneNumber: driver.phoneNumber,
        msg: `Dear ${driver.fullName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} has been renewed with AutoPadi.`,
      });

      res.status(200).json({
        message: "Subscription renewed successfully",
        subscription,
        payment: servicePlanPayment.subscriptionAmount,
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