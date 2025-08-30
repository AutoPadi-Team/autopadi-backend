const AdminPremiumPlan = require("../models/adminPremiumPlanModel");

// Create a new premium plan
exports.createPremiumPlan = async (req, res) => {
  try {
    const {
      title,
      description,
      benefits,
      category,
      promotionPriceMonthly,
      promotionPriceYearly,
      fixedPriceMonthly,
      fixedPriceYearly,
    } = req.body;

    const premiumPlanExists = await AdminPremiumPlan.findOne({
      description: { $regex: description, $options: "i" },
    });
    if (premiumPlanExists) {
      return res.status(400).json({
        success: false,
        message: `${premiumPlanExists.title} already exists.`,
      });
    }

    const newPlan = new AdminPremiumPlan({
      title,
      description,
      benefits: benefits.split(",").map((benefit) => benefit.trim()), // Split to array and trim benefits
      category,
      fixedPriceMonthly,
      fixedPriceYearly,
      fixedYearlyDiscountPercentage:
        fixedPriceMonthly && fixedPriceYearly
          ? (
              ((fixedPriceMonthly * 12 - fixedPriceYearly) /
                (fixedPriceMonthly * 12)) *
              100
            ).toFixed(1)
          : 0, // Calculate yearly discount percentage
      promotionPriceMonthly,
      promotionPriceYearly,
      promotionPercentage:
        promotionPriceYearly && fixedPriceYearly
          ? (
              ((fixedPriceYearly - promotionPriceYearly) / fixedPriceYearly) *
              100
            ).toFixed(1)
          : 0, // Calculate promotion percentage
    });
    await newPlan.save();

    res.status(201).json({
      success: false,
      message: "Premium plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//update a premium plan
exports.updatePremiumPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      benefits,
      category,
      promotionPriceMonthly,
      promotionPriceYearly,
      fixedPriceMonthly,
      fixedPriceYearly,
    } = req.body;

    // check if the plan exists
    const plan = await AdminPremiumPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Premium plan not found",
      });
    }

    // update the plan
    const updatePlan = await AdminPremiumPlan.findByIdAndUpdate(
      id,
      {
        title,
        description,
        benefits: benefits.split(",").map((benefit) => benefit.trim()),
        category,
        fixedPriceMonthly,
        fixedPriceYearly,
        fixedYearlyDiscountPercentage:
          fixedPriceMonthly && fixedPriceYearly
            ? (
                ((fixedPriceMonthly * 12 - fixedPriceYearly) /
                  (fixedPriceMonthly * 12)) *
                100
              ).toFixed(1)
            : 0, // Calculate yearly discount percentage
        promotionPriceMonthly,
        promotionPriceYearly,
        promotionPercentage:
          promotionPriceYearly && fixedPriceYearly
            ? (
                ((fixedPriceYearly - promotionPriceYearly) / fixedPriceYearly) *
                100
              ).toFixed(1)
            : 0, // Calculate promotion percentage
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Premium plan updated successfully",
      plan: updatePlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

//get all premium plans
exports.getAllPremiumPlans = async (req, res) => {
  try {
    const plans = await AdminPremiumPlan.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "All premium plans fetched successfully",
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

//get a single premium plan
exports.getPremiumPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plans = await AdminPremiumPlan.findById(id);
    if (!plans) {
      return res.status(404).json({
        success: false,
        message: "Premium plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Premium plan fetched successfully",
      plans,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

//delete a premium plan
exports.deletePremiumPlan = async (req, res) => {
    try {
        const { id } = req.params;
    
        const plan = await AdminPremiumPlan.findById(id);
        if (!plan) {
        return res.status(404).json({
            success: false,
            message: "Premium plan not found",
        });
        }
    
        await AdminPremiumPlan.findByIdAndDelete(id);
        res.status(200).json({
        success: true,
        message: "Premium plan deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`,
        });
    }
};
