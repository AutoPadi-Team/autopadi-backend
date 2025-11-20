const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: true,
    },
    fingerPrintId:{
      type: String,
    },
    referralCode: {
      type: String,
    },
    location: {
      lot: {
        type: Number,
      },
      lat: {
        type: Number,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["driver", "mechanic", "admin"],
      default: "driver",
    },
    refreshTokenExpiredAt: {
      type: Date,
    },
    premiumMember: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    businessDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
    },
    availability: {
      type: Boolean,
      default: false,
    },
    availabilityTime: {
      from: { type: Date },
      to: { type: Date },
    },
    connectors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectorsCount: { type: Number, default: 0 },
    connected: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connectedCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", usersSchema);
