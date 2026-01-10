const MechanicSubscriptionBalance = require("../models/mechanicSubscriptionBalanceModel");

// Get mechanic subscription balance by mechanic ID
exports.getMechanicSubscriptionBalance = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const balanceRecord = await MechanicSubscriptionBalance.findOne({
      mechanicId,
    }).populate("mechanicId", "fullName phoneNumber email");
    if (!balanceRecord) {
      return res.status(404).json({ message: "Balance record not found." });
    }
    res.status(200).json({
      message: "Mechanic subscription balance retrieved successfully",
      balanceDetails: balanceRecord,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error ${err.message}` });
  }
};

// get all mechanic subscription balances (admin)
exports.getAllMechanicSubscriptionBalances = async (req, res) => {
  try { 
    const balanceRecords = await MechanicSubscriptionBalance.find()
      .populate("mechanicId", "fullName phoneNumber email").sort({ createdAt: -1 });
    res.status(200).json({  
      message: "Mechanic subscription balances retrieved successfully",
      balanceRecords,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error ${err.message}` });
  } 
};
