const UrgentRequest = require("../models/urgentRequestModel");
const ServiceHistory = require("../models/serviceHistory");
const {
  connectedMechanics,
  connectedDrivers,
} = require("../websocket/websocketHandler");
const { getIO } = require("../websocket/server");

// driver create urgent request
exports.createUrgentRequest = async (req, res) => {
  try {
    const { driverId, mechanicId, vehicleInfo, issue, location } = req.body;

    if (!driverId || !mechanicId || !issue || !location) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: driverId, mechanicId, issue, date, location",
      });
    }

    // check for existing pending or ongoing request for a mechanic
    const existingRequest = await UrgentRequest.findOne({
      mechanicId,
      status: { $in: ["pending", "ongoing", "accepted"] },
    });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "The mechanic have an existing urgent request.",
      });
    }

    // create new urgent request
    const newRequest = new UrgentRequest({
      driverId,
      mechanicId,
      vehicleInfo,
      issue,
      location,
      status: "pending",
    });
    const savedRequest = await newRequest.save();
    await savedRequest.populate({
      path: "driverId",
      select: "fullName phoneNumber",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    // Notify mechanic in real-time
    const io = getIO();
    const mechanicSocketId = connectedMechanics.get(
      savedRequest.mechanicId.toString(),
    );
    if (mechanicSocketId) {
      io.to(mechanicSocketId).emit("new:request", {
        requestId: savedRequest._id,
        driver: savedRequest.driverId,
        vehicleInfo: savedRequest.vehicleInfo,
        issue: savedRequest.issue,
        location: savedRequest.location,
      });
    }
    return res.status(201).json({
      success: true,
      message: "Urgent request created successfully",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Error creating urgent request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating urgent request",
    });
  }
};

// mechanic declines request
exports.declineUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // check if request exist
    const existingRequest = await UrgentRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    // update request status to declined
    const urgentRequest = await UrgentRequest.findByIdAndUpdate(
      id,
      {
        status: "declined",
      },
      { new: true },
    ).populate({
      path: "mechanicId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    // notify driver
    const driverSocketId = connectedDrivers.get(
      urgentRequest.driverId.toString(),
    );
    const io = getIO();
    if (driverSocketId) {
      io.to(driverSocketId).emit("declined:request", {
        requestId: urgentRequest._id,
        mechanic: urgentRequest.mechanicId,
        message: "Your booking has been declined.",
        reason: `${reason || "No reason provided."}`,
      });
      console.log(`Driver ${driverSocketId} data: ${JSON.stringify(urgentRequest.status)}`);
    }

    res.status(200).json({
      success: true,
      message: "Driver request declined.",
      urgentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic accepts request
exports.acceptUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // check if urgent request exist
    const existingRequest = await UrgentRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Urgent request not found.",
      });
    }

    const urgentRequest = await UrgentRequest.findByIdAndUpdate(
      id,
      {
        status: "accepted",
      },
      { new: true },
    ).populate({
      path: "mechanicId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    // notify driver
    const driverSocketId = connectedDrivers.get(
      urgentRequest.driverId.toString(),
    );
    const io = getIO();
    if (driverSocketId) {
      io.to(driverSocketId).emit("accepted:request", {
        requestId: urgentRequest._id,
        mechanic: urgentRequest.mechanicId,
        message: "Your urgent request has been accepted.",
      });
        console.log(`Driver ${driverSocketId} data: ${JSON.stringify(urgentRequest.status)}`);
    }

    res.status(200).json({
      success: true,
      message: "Driver urgent request accepted.",
      urgentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic cancels request
exports.cancelUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // check if urgent request exist
    const existingRequest = await UrgentRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Urgent request not found.",
      });
    }

    const urgentRequest = await UrgentRequest.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
      },
      { new: true },
    ).populate({
      path: "mechanicId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    //collect data to history
    const serviceHistory = new ServiceHistory({
      mechanicId: urgentRequest.mechanicId,
      driverId: urgentRequest.driverId,
      issue: urgentRequest.issue,
      reason: reason,
      serviceStatus: urgentRequest.status,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();
    // notify driver
    const driverSocketId = connectedDrivers.get(
      urgentRequest.driverId.toString(),
    );
    if (driverSocketId) {
      io.to(driverSocketId).emit("cancelled:request", {
        requestId: urgentRequest._id,
        mechanic: urgentRequest.mechanicId,
        message: "Your urgent request has been cancelled.",
        reason: `${reason || "No reason provided."}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver booking cancelled.",
      urgentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// driver cancels request
exports.driverCancelUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // check if booking exist
    const existingRequest = await UrgentRequest.findById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Urgent request not found.",
      });
    }

    const urgentRequest = await UrgentRequest.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
      },
      { new: true },
    ).populate({
      path: "driverId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    //collect data to history
    const serviceHistory = new ServiceHistory({
      mechanicId: urgentRequest.mechanicId,
      driverId: urgentRequest.driverId,
      issue: urgentRequest.issue,
      serviceStatus: urgentRequest.status,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();
    // notify mechanics
    const mechanicSocketId = connectedMechanics.get(
      urgentRequest.mechanicId.toString(),
    );
    if (mechanicSocketId) {
      io.to(mechanicSocketId).emit("driver-cancelled:request", {
        requestId: urgentRequest._id,
        driver: urgentRequest.driverId,
        message: "Your customer cancelled the request.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver urgent request cancelled.",
      urgentRequest,
      serviceHistory: serviceHistory.serviceStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic completes request
exports.completeUrgentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // check if booking exist
    const existingUrgentRequest = await UrgentRequest.findById(id);
    if (!existingUrgentRequest) {
      return res.status(404).json({
        success: false,
        message: "Urgent request not found.",
      });
    }

    const urgentRequest = await UrgentRequest.findByIdAndUpdate(
      id,
      {
        status: "completed",
      },
      { new: true },
    ).populate({
      path: "mechanicId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });

    //collect data to history
    const serviceHistory = new ServiceHistory({
      mechanicId: urgentRequest.mechanicId,
      driverId: urgentRequest.driverId,
      issue: urgentRequest.issue,
      serviceStatus: urgentRequest.status,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();
    // notify driver
    const driverSocketId = connectedDrivers.get(
      urgentRequest.driverId.toString(),
    );
    if (driverSocketId) {
      io.to(driverSocketId).emit("completed:request", {
        requestId: urgentRequest._id,
        mechanic: urgentRequest.mechanicId,
        message: "Your urgent request has been completed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver urgent request completed.",
      urgentRequest,
      serviceHistory: serviceHistory.serviceStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get mechanic request
// exports.getMechanicRequest = async (req, res) => {
//   try {
//     const { mechanicId } = req.params;
//     const urgentRequest = await UrgentRequest.find({ mechanicId }).populate({
//       path: "driverId",
//       select: "fullName phoneNumber email",
//       populate: {
//         path: "profileImage",
//         select: "-_id image",
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Mechanic urgent requests fetched successfully.",
//       urgentRequest,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Internal server error: ${error.message}`,
//     });
//   }
// };

// get driver bookings
// exports.getDriverBooking = async (req, res) => {
//   try {
//     const { driverId } = req.params;
//     const serviceBooking = await ServiceBooking.find({ driverId }).populate({
//       path: "mechanicId",
//       select: "_id",
//       populate: {
//         path: "businessDetails",
//         select: "-_id picture businessName businessPhoneNumber businessEmail",
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Driver bookings fetched successfully.",
//       serviceBooking,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Internal server error: ${error.message}`,
//     });
//   }
// };

// get requests by id
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params; 

    const urgentRequest = await UrgentRequest.findById(id)
      .sort({ createdAt: -1 })
      .populate({
        path: "driverId",
        select: "fullName phoneNumber email",
        populate: {
          path: "profileImage",
          select: "-_id image",
        },
      })
      .populate({
        path: "mechanicId",
        select: "_id",
        populate: {
          path: "profileImage",
          select: "-_id image",
        },
      });

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully.",
      urgentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get all requests (admin)
exports.getAllRequest = async (req, res) => {
  try {
    const urgentRequest = await UrgentRequest.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "driverId",
        select: "fullName phoneNumber email",
        populate: {
          path: "profileImage",
          select: "-_id image",
        },
      })
      .populate({
        path: "mechanicId",
        select: "_id",
        populate: {
          path: "profileImage",
          select: "-_id image",
        },
      });

    res.status(200).json({
      success: true,
      message: "Requests fetched successfully.",
      urgentRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
