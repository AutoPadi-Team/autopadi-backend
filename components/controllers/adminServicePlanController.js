const AdminServicePlan = require("../models/adminServicePlanModel");

exports.createServicePlan = async (req, res) => {
  try {
    const { title, lowPrice, highPrice, benefits, bonuses, terms } = req.body;

    if (!title || !lowPrice || !highPrice || !benefits || !terms) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: title, lowPrice, highPrice, benefits, terms",
      });
    }

    // check if service plan with the same title already exists
    const servicePlanExists = await AdminServicePlan.findOne({
      title: { $regex: title, $options: "i" }
    });
    if (servicePlanExists) {
      return res.status(400).json({
        success: false,
        message: `${title} already exists`,
      });
    }

    const newPlan = new AdminServicePlan({
      title,
      lowPrice,
      highPrice,
      benefits: benefits.split(",").map((benefit) => benefit.trim()),
      bonuses: bonuses.split(",").map((bonus) => bonus.trim()),
      terms: terms.split(",").map((term) => term.trim()),
    });

    const savedPlan = await newPlan.save();
    res.status(201).json({
      success: true,
      message: "Service plan created successfully",
      plan: savedPlan,
    });
  } catch (error) {
    re.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.updateServicePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, lowPrice, highPrice, benefits, bonuses, terms } = req.body;
    const updatedPlan = await AdminServicePlan.findByIdAndUpdate(
      id,
      {
        title,
        lowPrice,
        highPrice,
        benefits: benefits.split(",").map((benefit) => benefit.trim()),
        bonuses: bonuses.split(",").map((bonus) => bonus.trim()),
        terms: terms.split(",").map((term) => term.trim()),
      },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({
        success: false,
        message: "Service plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.getAllServicePlans = async (req, res) => {
  try {
    const plans = await AdminServicePlan.find();
    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

exports.deleteServicePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await AdminServicePlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: "Service plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `${deletedPlan.title} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};
