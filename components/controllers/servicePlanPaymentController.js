const ServicePlanPayment = require("../models/servicePlanPaymentModel");
const User = require("../models/usersModel");


// Get service plan payments for all users
exports.getAllServicePlanPayments = async (req, res) => {
  try {
    const payments = await ServicePlanPayment.find()
      .populate("driverId", "fullName email phoneNumber")
      .populate("mechanicId", "fullName email phoneNumber")
      .populate("subscriptionId", "subscriptionType")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Service plan payments retrieved successfully",
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }     
};

// Get service plan payments for a specific user
exports.getServicePlanPaymentsByUserId = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const payments = await ServicePlanPayment.find({ mechanicId })
      .populate("driverId", "fullName email phoneNumber")
      .populate("mechanicId", "fullName email phoneNumber")
      .populate("subscriptionId", "subscriptionType")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Service plan payments retrieved successfully",
      payments,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }     
};