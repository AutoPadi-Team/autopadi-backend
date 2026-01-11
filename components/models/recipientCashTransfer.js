const mongoose = require("mongoose");

const recipientCashTransferSchema = new mongoose.Schema(
  {
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    recipientCode: {
      type: String,
    },
    reference: {
      type: String,
      required: true,
    },
    transferCode: {
      type: String,
      required: true,
    },
    transferStatus: {
      type: String,
      required: true,
      enum: ["pending", "successful", "failed", "reversed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RecipientCashTransfer",
  recipientCashTransferSchema
);
