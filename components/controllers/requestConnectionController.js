const RequestConnection = require("../models/requestConnectionModel");

// Send mechanic request
exports.sendMechanicRequest = async (req, res) => {
  const driverId = req.user.id;
  const { mechanicId } = req.params;

  try {
    // Check for already sent request
    const existingRequest = await RequestConnection.findOne({
      $and: [{ driverId }, { mechanicId }, { requestStatus: "pending" }],
    });
    if (existingRequest) {
      res.status(200).json({
        success: false,
        message: "Request already sent",
      });
    }

    // Add driver to request connection
    const requestConnection = new RequestConnection({
      mechanicId,
      driverId,
      requestStatus: "pending",
    });
    const savedRequestConnection = await requestConnection.save();

    res.status(201).json({
      success: true,
      message: "Request sent successfully",
      savedRequestConnection,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// Get drivers request
exports.getDriversRequest = async (req, res) => {
  const { mechanicId } = req.params;
  try {
    const driverRequest = await RequestConnection.find({ mechanicId })
      .populate({
        populate: {
          path: "profileImage",
          select: "image",
        },
        path: "driverId",
        select: "fullName rating",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Request fetched successfully",
      drivers: driverRequest,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// Get all request (admin)
exports.getAllDriversRequest = async (req, res) => {
  try {
    const driverRequest = await RequestConnection.find()
      .populate({
        populate: {
          path: "profileImage",
          select: "image",
        },
        path: "driverId",
        select: "fullName rating",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      drivers: driverRequest,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
