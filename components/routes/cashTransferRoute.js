const { getMobileMoneyList, createTransferReceipt, sendMoneyToRecipient } = require("../controllers/cashTransferController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.get("/mobile-money-list", verifyToken, getMobileMoneyList); // get mobile money list
router.post("/create-transfer-recipient", verifyToken, createTransferReceipt); // create transfer recipient
router.post("/send-money", verifyToken, sendMoneyToRecipient); // send money to recipient

module.exports = router;