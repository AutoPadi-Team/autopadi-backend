const cron = require("node-cron");
const ServiceBooking = require("../models/serviceBookingModel");
const smsInfo = require("../smsSender/smsInfo");

const serviceBookingReminder = async () => {
  const now = new Date(); // current date

  const serviceBooking = await ServiceBooking.find({
    bookingStatus: "accepted",
  }).populate("driverId mechanicId");

  for (let booking of serviceBooking) {
    try {
      const daysLeft = Math.floor((booking.date - now) / (1000 * 60 * 60 * 24)); // calculate days left
      const hoursLeft = Math.floor((booking.date - now) / (1000 * 60 * 60)); // calculate hours left

      const driver = booking.driverId;
      const mechanic = booking.mechanicId;

      if (!driver || !mechanic) continue;

      // driver and mechanic reminder on day 1
      if (daysLeft === 1) {
        // driver info
        const driverFirstName = driver.fullName.split(" ")[0];
        const driverMsg = `Hi ${driverFirstName}, your car service with ${mechanic.fullName} is due tomorrow (${booking.date.toDateString()})`;
        //mechanic info
        const mechanicFirstName = mechanic.fullName.split(" ")[0];
        const mechanicMsg = `Dear ${mechanicFirstName}, ${driver.fullName}'s car service is due tomorrow (${booking.date.toDateString()})`;
        console.log(mechanicMsg);
        // Send sms
          await smsInfo({
            phoneNumber: driver.phoneNumber,
            msg: driverMsg,
          });
          await smsInfo({
            phoneNumber: mechanic.phoneNumber,
            msg: mechanicMsg,
          });
      }

      //send reminder to mechanic in 1 hour
      if (hoursLeft === 1) {
        //mechanic info
        const mechanicFirstName = mechanic.fullName.split(" ")[0];
        const mechanicMsg = `Dear ${mechanicFirstName}, ${driver.fullName}'s car service is in an hour (${booking.date.toLocaleTimeString("en-GB", { hour12: true })})`;
        console.log(mechanicMsg);
          await smsInfo({
            phoneNumber: mechanic.phoneNumber,
            msg: mechanicMsg,
          });
      }
    } catch (error) {
      throw new Error(`Service booking reminder error: ${error.message}`);
    }
  }

  console.log(`Checking service booking reminder on ${now}`);
};

cron.schedule("0 * * * *", serviceBookingReminder);
module.exports = serviceBookingReminder;
