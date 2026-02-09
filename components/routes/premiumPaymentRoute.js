const { makePremiumPayment, renewPremiumPayment, cancelPremiumPayment, getUserPremiumPayment, getAllUserPremiumPayment } = require("../controllers/premiumPaymentController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.post("/make-premium-payment", verifyToken, makePremiumPayment); // make premium payment
router.post("/renew-premium-payment", verifyToken, renewPremiumPayment); // renew premium payment
router.post("/cancel-premium-payment", verifyToken, cancelPremiumPayment); // renew premium payment
router.get("/get-premium-payment/:userId", verifyToken, getUserPremiumPayment); // get user premium payments
router.get("/get-premium-payments", verifyToken, getAllUserPremiumPayment); // get all premium payments

module.exports = router;