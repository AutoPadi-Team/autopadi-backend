const mongoose = require("mongoose");

const urgentRequestSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleInfo: {
      image: String,
      carBrand: String,
      carModel: String,
      carYear: String,
      carLicensePlateNumber: String,
      carColor: {
        type: String,
        default: "none",
      },
    },
    issue: {
      type: String,
      required: true,
    },
    location: {
      addressName: {
        type: String,
      },
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "declined", "cancelled", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("UrgentRequest", urgentRequestSchema);