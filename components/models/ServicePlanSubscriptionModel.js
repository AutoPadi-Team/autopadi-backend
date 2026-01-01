const mongoose = require("mongoose");
const servicePlanSubscriptionSchema = new mongoose.Schema(
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
    subscriptionType: {
      type: String,
      required: true,
    },
    subscriptionAmount: {
      type: Number,
      required: true,
    },
    subscriptionStatus: {
        type: Boolean,
        default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  }
);
module.exports = mongoose.model(
  "ServicePlanSubscription",
  servicePlanSubscriptionSchema
);
