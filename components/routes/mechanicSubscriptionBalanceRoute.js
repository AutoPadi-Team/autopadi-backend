const { getMechanicSubscriptionBalance, getAllMechanicSubscriptionBalances } = require("../controllers/mechanicSubscriptionBalanceController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.get("/mechanic-subscription-balance/:mechanicId", verifyToken, getMechanicSubscriptionBalance); // get mechanic subscription balance by mechanic ID
router.get("/mechanic-subscription-balances", verifyToken, getAllMechanicSubscriptionBalances); // get all mechanic subscription balances (admin)
module.exports = router;