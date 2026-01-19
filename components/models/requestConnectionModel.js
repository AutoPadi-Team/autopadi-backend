const mongoose = require("mongoose");

const requestConnectionSchema = new mongoose.Schema(
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
    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RequestConnection", requestConnectionSchema);