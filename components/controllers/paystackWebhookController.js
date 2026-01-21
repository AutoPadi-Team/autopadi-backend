const User = require("../models/usersModel");
const MechanicSubscriptionBalance = require("../models/mechanicSubscriptionBalanceModel");
const ServicePlanSubscription = require("../models/ServicePlanSubscriptionModel");
const ServicePlanPayment = require("../models/servicePlanPaymentModel");
const CashTransfer = require("../models/recipientCashTransfer");
const smsInfo = require("../smsSender/smsInfo");
const crypto = require("crypto");
const secret = process.env.PAYSTACK_SECRET_KEY;

// Handle Paystack webhook for successful payment
exports.paystackWebhook = async (req, res) => {
  try {
    //validate event
    const hash = crypto.createHmac("sha512", secret).update(req.rawBody).digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) return res.status(400).send("Invalid signature");

    // Process the webhook event data
    const event = req.body;
    // Deconstruct event data
    const { reference, amount, channel, metadata } = event.data;
    const driverId = metadata?.custom_fields.find(f => f.variable_name === "driver_id")?.value;
    const mechanicId = metadata?.custom_fields.find(f => f.variable_name === "mechanic_id")?.value;
    const packageId = metadata?.custom_fields.find(f => f.variable_name === "package_id")?.value;
    const subscriptionType = metadata?.custom_fields.find(f => f.variable_name === "subscription_type")?.value;
    const subscriptionId = metadata?.custom_fields.find(f => f.variable_name === "subscription_id")?.value;
    const paymentModel = metadata?.custom_fields.find(f => f.variable_name === "payment_model")?.value;
    const subscriptionAmount = amount / 100; // Convert from pesewas to ghana cedis
    const paymentReference = reference;
    const moneyChannel = channel;
    
    // Log the received data for debugging
    const paymentData = { driverId, mechanicId, packageId, subscriptionType, subscriptionAmount, paymentReference, moneyChannel, metadata, subscriptionId, paymentModel };
    console.log("✅ Received Paystack Webhook Event:", JSON.stringify(paymentData, null, 2));

    // Handle new service plan subscription payment
    if (event.event === "charge.success" && paymentModel === "new-service-plan-subscription") {
      if (event.event === "charge.success") {
        // Create new subscription
        const start = new Date(Date.now());
        const stopDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        const newSubscription = new ServicePlanSubscription({
          driverId,
          mechanicId,
          packageId,
          subscriptionType,
          subscriptionAmount,
          subscriptionStatus: true,
          maintenanceTask: "pending",
          startDate: start,
          endDate: stopDate,
        });
        const savedSubscription = await newSubscription.save();

        // Create payment record
        const servicePlanPayment = new ServicePlanPayment({
          subscriptionId: savedSubscription._id,
          driverId: savedSubscription.driverId,
          mechanicId: savedSubscription.mechanicId,
          reference: paymentReference,
          paymentChannel: moneyChannel,
          subscriptionType: "new",
          subscriptionAmount: savedSubscription.subscriptionAmount,
        });
        const savedPayment = await servicePlanPayment.save();

        // Update mechanic subscription balance
        await MechanicSubscriptionBalance.findOneAndUpdate(
          {
            mechanicId: savedPayment.mechanicId,
          },
          { $inc: { balanceAmount: savedPayment.subscriptionAmount } },
          { new: true },
        );

        // Send SMS notifications to driver and mechanic
        const driver = await User.findById(savedPayment.driverId);
        const mechanic = await User.findById(savedPayment.mechanicId);

        const driverFirstName = driver.fullName.split(" ")[0];
        const mechanicFirstName = mechanic.fullName.split(" ")[0];

        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${driverFirstName}, you've successfully subscribed to ${
            mechanic.fullName
          }'s ${
            savedSubscription.subscriptionType
          } with AutoPadi.\nStart Date: ${savedSubscription.startDate.toDateString()}\nEnd Date: ${savedSubscription.endDate.toDateString()}`,
        });
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: `Dear ${mechanicFirstName}, your customer ${driver.fullName} has subscribed to your ${savedSubscription.subscriptionType} with AutoPadi. `,
        });
      } else {
        const driver = await User.find(driverId);
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${driver.fullName}, your subscription ${event.event}`,
        });
      }
    }

    // Handle renew service plan subscription payment
    if (event.event.startsWith("charge.") && paymentModel === "renew-service-plan-subscription") {
      // find that particular subscription
      const subscription = await ServicePlanSubscription.findById(subscriptionId);
      if(event.event === "charge.success"){
        // Extend subscription end date by 30 days and reactivate
        const newEndDate = new Date(
          subscription.endDate.getTime() + 30 * 24 * 60 * 60 * 1000
        ); // Extend by 30 days
        subscription.endDate = newEndDate;
        subscription.subscriptionStatus = true;
        subscription.maintenanceTask = "pending";
        await subscription.save();
  
        // Create payment record for renewal
        const servicePlanPayment = new ServicePlanPayment({
          subscriptionId: subscription._id,
          driverId: subscription.driverId,
          mechanicId: subscription.mechanicId,
          reference: paymentReference,
          paymentChannel: moneyChannel,
          subscriptionType: "renewal",
          subscriptionAmount: subscription.subscriptionAmount,
        });
        await servicePlanPayment.save();
  
        // Update mechanic subscription balance
        await MechanicSubscriptionBalance.findOneAndUpdate(
          {
            mechanicId: subscription.mechanicId,
          },
          { $inc: { balanceAmount: subscription.subscriptionAmount } },
          { new: true }
        );
  
        // Send SMS notification to driver
        const driver = await User.findById(subscription.driverId);
        const mechanic = await User.findById(subscription.mechanicId);
        const firstName = driver.fullName.split(" ")[0];
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${
            subscription.subscriptionType
          } has been renewed with AutoPadi.\nStart Date: ${subscription.startDate.toDateString()}\nEnd Date: ${subscription.endDate.toDateString()}`,
        });
      }
      else {
        const driver = await User.findById(subscription.driverId);
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${driver.fullName}, your renew subscription ${event.event}`,
        });
      }

    }

    // Handle transfer  events
    if(event.event.startsWith("transfer.")) {
      const { reference } = event.data;
      // transfer successful
      if (event.event === "transfer.success") {
        const cashTransfer = await CashTransfer.findOneAndUpdate(
          { reference: reference },
          { transferStatus: "successful" },
          { new: true }
        );
        // Update mechanic subscription balance
        await MechanicSubscriptionBalance.findOneAndUpdate(
          {
            mechanicId: cashTransfer.mechanicId,
          },
          { $inc: { balanceAmount: -cashTransfer.amount } },
          { new: true }
        );
        console.log(`✅ Transfer successful: ${event.event} - ${JSON.stringify(cashTransfer, null, 2)}`);
      }

      // transfer failed
      if (event.event === "transfer.failed") {
        await CashTransfer.findOneAndUpdate(
          { reference: reference },
          { transferStatus: "failed" },
          { new: true }
        );
        console.log(`❌ Transfer failed: ${event.event}`);
      }

      // transfer reversed
      if (event.event === "transfer.reversed") {
        await CashTransfer.findOneAndUpdate(
          { reference: reference },
          { transferStatus: "reversed" },
          { new: true }
        );
        console.log(`↩️ Transfer reversed: ${event.event}`);
      }
    }

    res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error(`Internal server error: ${error.message}`);

    res
      .status(500)
      .json({
        success: false,
        message: `Internal server error: ${error.message}`,
      });
  }
};
