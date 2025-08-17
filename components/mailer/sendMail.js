const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

exports.sendMail = async ({ email, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"AutoPadi" ${process.env.USER}`,
      to: email,
      subject: subject,
      html: html,
    });

    // console.log("Message sent:", info.messageId);
    return info; // Return the info object for further processing if needed
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};
