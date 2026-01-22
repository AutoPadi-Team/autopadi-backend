const mongoose = require("mongoose");

const serviceBookingSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mechanicId: {
      type: mongoose.Types.ObjectId,
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
    Date: {
      type: Date,
      required: true,
    },
    Time: {
      type: Date,
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
    bookingStatus: {
      type: String,
      enum: ["pending", "accepted", "declined", "completed", "cancelled"],
      default: "pending"
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ServiceBooking", serviceBookingSchema);
