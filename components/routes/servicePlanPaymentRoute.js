const { getAllServicePlanPayments, getServicePlanPaymentsByUserId } = require("../controllers/servicePlanPaymentController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.get("/all-subscription-payments", verifyToken, getAllServicePlanPayments);
router.get("/mechanic-subscription-payments/:mechanicId", verifyToken, getServicePlanPaymentsByUserId);

module.exports = router;