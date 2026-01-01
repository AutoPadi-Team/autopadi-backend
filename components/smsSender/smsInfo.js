const axios = require("axios");

const smsInfo = async ({ phoneNumber, msg }) => {
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
        message: msg,
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

module.exports = smsInfo;
