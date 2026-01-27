const cron = require("node-cron");
const ServicePlanSubscriptionModel = require("../models/ServicePlanSubscriptionModel");
const smsInfo = require("../smsSender/smsInfo");

const ServiceSubscriptionReminders = async () => {
  try {
    const now = new Date(); // Pick up the current date

    // Update subscriptionStatus to false for expired subscriptions
    const deactivatedSubscriptions = await ServicePlanSubscriptionModel.updateMany(
      {
        subscriptionStatus: true,
        endDate: { $lt: now },
      },
      {
        $set: { subscriptionStatus: false },
      }
    );
    if (deactivatedSubscriptions.modifiedCount > 0) {
      console.log(`Deactivated ${deactivatedSubscriptions.modifiedCount} subscription(s).`);
    }

    // Fetch all active subscriptions
    const activeSubscriptions = await ServicePlanSubscriptionModel.find({
      subscriptionStatus: true,
    }).populate("driverId mechanicId");
    for (let sub of activeSubscriptions) {
      const driver = sub.driverId;
      const mechanic = sub.mechanicId;

      if (!driver || !mechanic) continue;

      const daysLeft = Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24));

      // Reminder for mechanic maintenance task
      if (sub.maintenanceTask === "pending" && [10, 7, 3, 1].includes(daysLeft)) {
        const firstName = mechanic.fullName.split(" ")[0];
        const message = `Dear ${firstName}, complete monthly ${sub.subscriptionType} servicing for ${driver.fullName}. Kindly update the subscription maintenance task when done.`;
        // Send sms
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: message,
        });
        console.log(`Sent mechanic reminder (${daysLeft} days left)`);
      }

      // Reminder for driver subscription expiry
      if ([7, 3, 1].includes(daysLeft)) {
        const firstName = driver.fullName.split(" ")[0];
        const expiryText = daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`;
        const message = `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${sub.subscriptionType} expires ${expiryText} (${sub.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`;
        // Send sms
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: message,
        });
        console.log(`Sent driver reminder (${daysLeft} days left)`);
      }
    }

    console.log(`Checked subscriptions at ${now.toISOString()}`);
  } catch (error) {
    console.error("Error in service subscription reminders:", error.message);
  }
};

// Run daily at 8:00 AM
cron.schedule("0 8 * * *", ServiceSubscriptionReminders);

module.exports = ServiceSubscriptionReminders;
