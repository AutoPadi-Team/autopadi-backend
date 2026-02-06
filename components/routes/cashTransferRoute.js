const { getMobileMoneyList, getRecipientById, getRecipients, createTransferReceipt, sendMoneyToRecipient } = require("../controllers/cashTransferController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.get("/mobile-money-list", verifyToken, getMobileMoneyList); // get mobile money list
router.post("/create-transfer-recipient", verifyToken, createTransferReceipt); // create transfer recipient
router.get("/get-recipient/:userId", verifyToken, getRecipientById); // get recipient by id
router.get("/get-all-recipients", verifyToken, getRecipientById); // get all recipients
router.post("/send-money", verifyToken, sendMoneyToRecipient); // send money to recipient

module.exports = router;