const mongoose = require("mongoose");

const adminPremiumPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    benefits: [
      {
        type: String,
      },
    ],
    category: {
        type: String,
        enum: ["driver", "mechanic"],
        default: "driver",
    },
    promotionPriceMonthly: {
      type: Number,
      default: 0,
    },
    isDiscount: {
      type: Boolean,
      default: false,
    },
    promotionPriceYearly: {
      type: Number,
      default: 0,
    },
    fixedPriceMonthly: {
      type: Number,
      required: true,
      default: 0,
    },
    fixedPriceYearly: {
      type: Number,
      required: true,
      default: 0,
    },
    fixedYearlyDiscountPercentage: {
      type: Number,
      default: 0,
    },
    promotionPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AdminPremiumPlan", adminPremiumPlanSchema);
