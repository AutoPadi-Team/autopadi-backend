const User = require("../models/usersModel");

// connect mechanic
exports.connectMechanic = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { mechanicId } = req.params;

    // check if mechanic exists
    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== "mechanic") {
      return res
        .status(404)
        .json({ success: false, message: "Mechanic not found" });
    }

    // check if driver already connected to mechanic
    const driver = await User.findById(driverId);
    if (driver.connected.includes(mechanicId)) {
      return res.status(400).json({
        success: false,
        message: "You are already connected to this mechanic",
      });
    }

    // add mechanic to driver's connected list
    const updatedDriverConnected = await User.findByIdAndUpdate(
      driverId,
      { $push: { connected: mechanicId }, $inc: { connectedCount: 1 } },
      { new: true }
    );

    // add driver to mechanic's connectors list
    const updatedMechanicConnectors = await User.findByIdAndUpdate(
      mechanicId,
      { $push: { connectors: driverId }, $inc: { connectorsCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Connected to mechanic successfully",
      driver: {
        connected: updatedDriverConnected.connected,
        connectedCount: updatedDriverConnected.connectedCount,
      },
      mechanic: {
        connectors: updatedMechanicConnectors.connectors,
        connectorsCount: updatedMechanicConnectors.connectorsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// disconnect mechanic
exports.disconnectMechanic = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { mechanicId } = req.params;

    // check if mechanic exists
    const mechanic = await User.findById(mechanicId);
    if (!mechanic || mechanic.role !== "mechanic") {
      return res
        .status(404)
        .json({ success: false, message: "Mechanic not found" });
    }

    // check if driver is not connected to mechanic
    const driver = await User.findById(driverId);
    if (!driver.connected.includes(mechanicId)) {
      return res.status(400).json({
        success: false,
        message: "You are not connected to this mechanic",
      });
    }

    // remove mechanic from driver's connected list
    const updatedDriverConnected = await User.findByIdAndUpdate(
      driverId,
      { $pull: { connected: mechanicId }, $inc: { connectedCount: -1 } },
      { new: true }
    );

    // remove driver from mechanic's connectors list
    const updatedMechanicConnectors = await User.findByIdAndUpdate(
      mechanicId,
      { $pull: { connectors: driverId }, $inc: { connectorsCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Disconnected from mechanic successfully",
      driver: {
        connected: updatedDriverConnected.connected,
        connectedCount: updatedDriverConnected.connectedCount,
      },
      mechanic: {
        connectors: updatedMechanicConnectors.connectors,
        connectorsCount: updatedMechanicConnectors.connectorsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get all connected mechanics for a driver
exports.getConnectedMechanics = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await User.findById(driverId).populate("connected", "_id fullName email phoneNumber location isVerified role");

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Mechanic not found" });
    };

    res
      .status(200)
      .json({
        success: true,
        message: "Connected mechanics fetched successfully",
        connectedMechanics: driver.connected,
        connectedCount: driver.connectedCount,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// get all connected drivers for a mechanic
exports.getConnectedDrivers = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const mechanic = await User.findById(mechanicId).populate("connectors", "_id fullName email phoneNumber location isVerified role");

    if (!mechanic) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Connected mechanics fetched successfully",
        connectedDivers: mechanic.connectors,
        connectedCount: mechanic.connectorsCount,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
