const cron = require("node-cron");
const ServicePlanSubscriptionModel = require("../models/ServicePlanSubscriptionModel");
const User = require("../models/usersModel");
const smsInfo = require("../smsSender/smsInfo");

const ServiceSubscriptionReminders = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day ahead

    const getFormattedDate = (date) => {
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));

        return { $gte: start, $lte: end };
    };

    const subscriptions = await ServicePlanSubscriptionModel.find({
      subscriptionStatus: true,
      $or: [
        { endDate: getFormattedDate(threeDaysFromNow) },
        { endDate: getFormattedDate(oneDayFromNow) },
      ],
    });

    for (let subscription of subscriptions) {
      const driver = await User.findById(subscription.driverId);
      const mechanic = await User.findById(subscription.mechanicId);
      const daysLeft = Math.floor((subscription.endDate - now) / (1000 * 60 * 60 * 24));

      const firstName = driver.fullName.split(" ")[0]; // Get first name for personalization
      
      // Send 3-day reminder
      if (daysLeft === 3) {
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires in ${daysLeft} days ${subscription.endDate.toDateString()}. Renew now with AutoPadi to avoid service cuts.`,
        });
      }

      // Send 1-day reminder
      if (daysLeft === 1) {
        // Send 1-day reminder
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires tomorrow ${subscription.endDate.toDateString()}. Renew now with AutoPadi to avoid service cuts.`,
        });
      }
    }

    console.log(`Checking for subscriptions nearing expiration days ${new Date()}`);
  } catch (error) {

    console.error("Error in service subscription reminders:", error.message);
  }
};

cron.schedule("0 9 * * *", ServiceSubscriptionReminders);
module.exports = ServiceSubscriptionReminders;