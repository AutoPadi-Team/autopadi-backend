const mongoose = require("mongoose");

const serviceHistorySchema = new mongoose.Schema(
  {
    mechanicId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issue: {
      type: String,
    },
    note: {
      type: String,
    },
    amount: {
      type: Number,
    },
    serviceStatus: String,
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("serviceHistory", serviceHistorySchema);