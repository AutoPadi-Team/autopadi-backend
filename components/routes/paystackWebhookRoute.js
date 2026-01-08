const { paystackWebhook } = require("../controllers/paystackWebhookController");
const express = require("express");
const router = express.Router();

router.post("/paystack-webhook", paystackWebhook); // Paystack webhook endpoint

module.exports = router;