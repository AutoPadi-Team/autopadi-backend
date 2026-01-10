const { getMechanicSubscriptionBalance } = require("../controllers/mechanicSubscriptionBalanceController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.get("/mechanic-subscription-balance/:mechanicId", verifyToken, getMechanicSubscriptionBalance); // get mechanic subscription balance by mechanic ID

module.exports = router;