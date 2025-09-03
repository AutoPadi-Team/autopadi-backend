const axios = require("axios");

const smsSender = async ({ name, phoneNumber, code }) => {
  try {
    const response = await axios.post(
      "https://frogapi.wigal.com.gh/api/v3/sms/send",
      {
        senderid: process.env.SMS_SENDERID,
        destinations: [
          {
            destination: phoneNumber,
            msgid: "MGS1010101",
          },
        ],
        message: `Dear ${name}, your verification code for AutoPadi is ${code}. Please ensure that you do not share this code with anyone. This code will expire in 10 minutes time.`,
        smstype: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "API-KEY": process.env.SMS_API_KEY,
          USERNAME: process.env.SMS_USERNAME,
        },
      }
    );
    console.log("SMS sent successfully: ", response.data);
    return response.data;
    
  } catch (error) {
    console.error(
      `Error sending SMS: ${JSON.stringify(
        error.response ? error.response.data : error.message
      )}`
    );
  }
};

module.exports = smsSender;
