const cron = require("node-cron");
const ServicePlanSubscriptionModel = require("../models/ServicePlanSubscriptionModel");
const User = require("../models/usersModel");
const smsInfo = require("../smsSender/smsInfo");

const ServiceSubscriptionReminders = async () => {
  try {
    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days ahead(mechanic maintenance task)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day ahead


    // Helper function to get start and end of day
    const getFormattedDate = (date) => {
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return { $gte: start, $lte: end };
    };

    // update subscriptionStatus to false for expired subscriptions
    const deactivatedSubscriptions = await ServicePlanSubscriptionModel.updateMany({
        subscriptionStatus: true,
        endDate: { $lt: now },
    }, {
        $set: { subscriptionStatus: false }
    });

    if (deactivatedSubscriptions.modifiedCount > 0) {
        console.log(`Deactivated ${deactivatedSubscriptions.modifiedCount} subscription(s).`);
    }
    
    // Find maintenance tasks that are pending and expiring in 10 days, 7 days, 3 days or 1 day
    const mechanicMaintenanceTasks = await ServicePlanSubscriptionModel.find({
      subscriptionStatus: true,
      maintenanceTask: "pending",
      $or: [
        { endDate: getFormattedDate(tenDaysFromNow) },
        { endDate: getFormattedDate(sevenDaysFromNow) },
        { endDate: getFormattedDate(threeDaysFromNow) },
        { endDate: getFormattedDate(oneDayFromNow) },
      ],
    }).populate("driverId mechanicId");

    for (let maintenance of mechanicMaintenanceTasks) {
      const driver = maintenance.driverId;
      const mechanic = maintenance.mechanicId;
      const daysLeft = Math.ceil(
        (maintenance.endDate - now) / (1000 * 60 * 60 * 24)
      );
    
      const firstName = mechanic.fullName.split(" ")[0]; // Get first name for personalization
      console.log(`Dear ${firstName}, complete monthly ${maintenance.subscriptionType} servicing for ${driver.fullName}. Kindly update the subscription maintenance task when done.`);
      const message = `Dear ${firstName}, complete monthly ${maintenance.subscriptionType} servicing for ${driver.fullName}. Kindly update the subscription maintenance task when done.`;
      // Send 10-day reminder
      if (daysLeft === 10) {
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: message,
        });
        console.log(
          `Dear ${firstName}, complete monthly ${maintenance.subscriptionType} servicing for ${driver.fullName}. Kindly update the subscription maintenance task when done.`
        );
      }
      // Send 7-day reminder
      if (daysLeft === 7) {
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: message,
        });
      }
      // Send 3-day reminder
      if (daysLeft === 3) {
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: message,
        });
      }

      // Send 1-day reminder
      if (daysLeft === 1) {
        // Send 1-day reminder
        await smsInfo({
          phoneNumber: mechanic.phoneNumber,
          msg: message,
        });
      }
    }

    // Find subscriptions that are expiring in 7 days, 3 days or 1 day
    const subscriptions = await ServicePlanSubscriptionModel.find({
      subscriptionStatus: true,
      $or: [ 
        { endDate: getFormattedDate(sevenDaysFromNow) },
        { endDate: getFormattedDate(threeDaysFromNow) },
        { endDate: getFormattedDate(oneDayFromNow) },
      ],
    }).populate("driverId mechanicId");

    for (let subscription of subscriptions) {
      const driver = subscription.driverId;
      const mechanic = subscription.mechanicId;
      const daysLeft = Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24));
      
      const firstName = driver.fullName.split(" ")[0]; // Get first name for personalization
      console.log(
        `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${
          subscription.subscriptionType
        } expires ${daysLeft} days (${subscription.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`
      );
      
      // Send 7-day reminder
      if (daysLeft === 7) {
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires in ${daysLeft} days (${subscription.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`,
        });
      }
      // Send 3-day reminder
      if (daysLeft === 3) {
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires in ${daysLeft} days (${subscription.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`,
        });
      }

      // Send 1-day reminder
      if (daysLeft === 1) {
        // Send 1-day reminder
        await smsInfo({
          phoneNumber: driver.phoneNumber,
          msg: `Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires tomorrow (${subscription.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`,
        });
        console.log(`Dear ${firstName}, your subscription to ${mechanic.fullName}'s ${subscription.subscriptionType} expires tomorrow (${subscription.endDate.toDateString()}). Renew now with AutoPadi to avoid service cuts.`);
        
      }
    }

    console.log(`Checking for subscriptions nearing expiration days ${new Date()}`);
  } catch (error) {
    console.error("Error in service subscription reminders:", error.message);
  }
};

cron.schedule("0 8 * * *", ServiceSubscriptionReminders);
module.exports = ServiceSubscriptionReminders;