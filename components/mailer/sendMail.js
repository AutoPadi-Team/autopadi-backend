const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  // host: "smtp.zoho.com",
  // port: 465,
  // secure: true,
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_PASS,
  },
});

// send the email to the user
exports.sendMail = async ({ email, subject, html }) => {
  if (!email) {
    console.error("No recipient email provided");
  }
  try {
    const info = await transporter.sendMail({
      from: `"AutoPadi Organisation"" ${process.env.GOOGLE_USER}`,
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
