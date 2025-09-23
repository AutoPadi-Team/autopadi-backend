const mongoose = require("mongoose");

const inactiveUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["driver", "mechanic", "admin"],
      default: "driver",
      required: true,
    },
    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    connectors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectorsCount: { type: Number, default: 0 },
    connected: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectedCount: { type: Number, default: 0 },
    reason: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("InactiveUser", inactiveUserSchema);
