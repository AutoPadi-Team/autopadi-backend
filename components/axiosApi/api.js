const axios = require("axios");

module.exports = axios.create({
  baseURL: "https://api.paystack.co/",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
});
