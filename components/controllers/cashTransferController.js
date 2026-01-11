const api = require("../axiosApi/api");
const Recipient = require("../models/recipientModel");
const RecipientCashTransfer = require("../models/recipientCashTransfer");
// const { v4: uuid4 } = require("uuid");
// const referenceCode = uuid4();

// Get mobile money list
exports.getMobileMoneyList = async (req, res) => {
  try {
    const response = await api.get("bank?currency=GHS&type=mobile_money");
    // Destructure the data
    const { status, message, data } = response.data;

    res.status(200).json({
      success: status,
      message: message,
      data: data.map((data) => ({
        bankName: data.name,
        bankCode: data.code,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// Create transfer recipient
exports.createTransferReceipt = async (req, res) => {
  try {
    const { name, accountNumber, bankCode } = req.body;
    const response = await api.post("transferrecipient", {
      type: "mobile_money",
      name: name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "GHS",
    });

    // Destructure response data
    const { status, message, data } = response.data;

    // Check if recipient already exists
    const existingRecipient = await Recipient.findOne({
      recipientCode: data.recipient_code,
    });
    if (existingRecipient)
      return res
        .status(400)
        .json({ success: true, message: "recipient already exist" });
    // Save recipient to database
    const newRecipient = new Recipient({
      recipientCode: data.recipient_code,
      name: data.name,
      accountNumber: data.details.account_number,
      bankCode: data.details.bank_code,
    });
    const savedRecipient = await newRecipient.save();

    res.status(201).json({
      success: status,
      message: message,
      data: savedRecipient,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// Send money to recipient
exports.sendMoneyToRecipient = async (req, res) => {
  try {
    const { amount, accountNumber } = req.body;

    // Verify recipient exists
    const existingRecipient = await Recipient.findOne({
      accountNumber,
    });
    if (!existingRecipient) {
      return res.status(400).json({
        success: true,
        message: "recipient not found",
      });
    }
    console.log(`Generated UUID: txn_${referenceCode}`);
    const response = await api.post("transfer", {
      source: "balance",
      amount: amount * 100, // amount in pesewas from ghana cedi
      reference: `txn_${referenceCode}`,
      recipient: existingRecipient.recipientCode,
      reason: "Mechanic payment",
    });

    // Destructure response data
    const { status, message, data } = response.data;

    // Save transfer details to database
    const newTransfer = new RecipientCashTransfer({
      name: existingRecipient.name,
      accountNumber: existingRecipient.accountNumber,
      bankCode: existingRecipient.bankCode,
      amount: amount,
      recipientCode: existingRecipient.recipientCode,
      reference: data.reference,
      transferCode: data.transfer_code,
      transferStatus: "pending",
    });
    const savedTransfer = await newTransfer.save();

    res.status(200).json({
      success: status,
      message: message,
      data: savedTransfer,
    });
  } catch (error) {
    console.error("Error sending money:", error);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message} - ${error.response?.data?.message}`,
    });
  }
};
