const { getIO } = require("../websocket/server");
const { connectedMechanics, connectedDrivers, } = require("../websocket/websocketHandler");
const ServiceBooking = require("../models/serviceBookingModel");
const ServiceHistory = require("../models/serviceHistory");

// driver books service
exports.bookService = async (req, res) => {
  try {
    const { driverId, mechanicId, vehicleInfo, issue, date, time, location } =
      req.body;
    // check if the there already pending booking
    const existingBooking = await ServiceBooking.findOne({
      $and: [{ driverId }, { mechanicId }],
      bookingStatus: "pending",
    });
    if (existingBooking) {
      return res.status(404).json({
        success: false,
        message: "There is booking pending.",
      });
    }

    // saved to collection
    const serviceBooking = new ServiceBooking({
      driverId,
      mechanicId,
      vehicleInfo,
      issue,
      date,
      time,
      location,
      bookingStatus: "pending",
    });
    await serviceBooking.save();

    // display driver details
    await serviceBooking.populate({
        path: "driverId", 
        select: "fullName",
        populate: {
            path: "profileImage",
            select: "-_id image"
        }
    });

    //send real-time notice to mechanic
    const mechanicSocketId = connectedMechanics.get(
      serviceBooking.mechanicId.toString(),
    );
    // socket connection
    const io = getIO();
    if (mechanicSocketId) {
      io.to(mechanicSocketId).emit("new:booking", {
        bookingId: serviceBooking._id,
        driver: serviceBooking.driverId,
        vehicleInfo: serviceBooking.vehicleInfo,
        issue: serviceBooking.issue,
        date: serviceBooking.date,
        time: serviceBooking.time,
        location: serviceBooking.location,
      });
    }

    res.status(201).json({
      success: true,
      message: `Booking created successfully.`,
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic declines bookings
exports.declineBookService = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // check if booking exist
    const existingBooking = await ServiceBooking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const serviceBooking = await ServiceBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "declined",
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
      serviceBooking.driverId.toString(),
    );
    const io = getIO();
    if (driverSocketId) {
      io.to(driverSocketId).emit("declined:booking", {
        bookingId: serviceBooking._id,
        mechanic: serviceBooking.mechanicId,
        message: "Your booking has been declined.",
        reason: `${reason || "No reason provided."}`,
      });
      console.log(
        `Driver data: ${JSON.stringify(serviceBooking.bookingStatus)}`,
      );
    }

    res.status(200).json({
      success: true,
      message: "Driver booking declined.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic accepts bookings
exports.acceptBookService = async (req, res) => {
  try {
    const { id } = req.params;

    // check if booking exist
    const existingBooking = await ServiceBooking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const serviceBooking = await ServiceBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "accepted",
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
      serviceBooking.driverId.toString(),
    );
    const io = getIO();
    if (driverSocketId) {
      io.to(driverSocketId).emit("accepted:booking", {
        bookingId: serviceBooking._id,
        mechanic: serviceBooking.mechanicId,
        message: "Your booking has been accepted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver booking accepted.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic cancels bookings
exports.cancelBookService = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // check if booking exist
    const existingBooking = await ServiceBooking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const serviceBooking = await ServiceBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "cancelled",
      },
      { new: true },
    ).populate({
      path: "mechanicId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });;

    //collect data to history
    const serviceHistory = new ServiceHistory({
      mechanicId: serviceBooking.mechanicId,
      driverId: serviceBooking.driverId,
      issue: serviceBooking.issue,
      reason: reason,
      serviceStatus: serviceBooking.bookingStatus,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();
    // notify driver
    const driverSocketId = connectedDrivers.get(
      serviceBooking.driverId.toString(),
    );
    if (driverSocketId) {
      io.to(driverSocketId).emit("cancelled:booking", {
        bookingId: serviceBooking._id,
        mechanic: serviceBooking.mechanicId,
        message: "Your booking has been cancelled.",
        reason: `${reason || "No reason provided."}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver booking cancelled.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// driver cancels bookings
exports.driverCancelBookService = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // check if booking exist
    const existingBooking = await ServiceBooking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const serviceBooking = await ServiceBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "cancelled",
      },
      { new: true },
    ).populate({
      path: "driverId",
      select: "fullName",
      populate: {
        path: "profileImage",
        select: "-_id image",
      },
    });;

    //collect data to history
    const serviceHistory = new ServiceHistory({
      mechanicId: serviceBooking.mechanicId,
      driverId: serviceBooking.driverId,
      issue: serviceBooking.issue,
      reason: reason,
      serviceStatus: serviceBooking.bookingStatus,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();
    // notify mechanics
    const mechanicSocketId = connectedMechanics.get(
      serviceBooking.mechanicId.toString(),
    );
    if (mechanicSocketId) {
      io.to(mechanicSocketId).emit("driver-cancelled:booking", {
        bookingId: serviceBooking._id,
        driver: serviceBooking.driverId,
        message: "Your customer cancelled the booking.",
        reason: `${reason || "No reason provided."}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver booking cancelled.",
      serviceBooking,
      serviceHistory: serviceHistory.serviceStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// mechanic completes bookings
exports.completeBookService = async (req, res) => {
  try {
    const { id } = req.params;

    // check if booking exist
    const existingBooking = await ServiceBooking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const serviceBooking = await ServiceBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: "completed",
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
      mechanicId: serviceBooking.mechanicId,
      driverId: serviceBooking.driverId,
      issue: serviceBooking.issue,
      serviceStatus: serviceBooking.bookingStatus,
    });
    await serviceHistory.save();

    // socket connection
    const io = getIO();

    // notify driver
    const driverSocketId = connectedDrivers.get(
      serviceBooking.driverId.toString(),
    );
    if (driverSocketId) {
      io.to(driverSocketId).emit("completed:booking", {
        bookingId: serviceBooking._id,
        mechanic: serviceBooking.mechanicId,
        message: "Your booking has been completed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver booking completed.",
      serviceBooking,
      serviceHistory: serviceHistory.serviceStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get mechanic bookings
exports.getMechanicBooking = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const serviceBooking = await ServiceBooking.find({ mechanicId })
      .populate({
        path: "driverId",
        select: "fullName phoneNumber email",
        populate: {
          path: "profileImage",
          select: "-_id image",
        },
      })

    res.status(200).json({
      success: true,
      message: "Mechanic bookings fetched successfully.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get driver bookings
exports.getDriverBooking = async (req, res) => {
  try {
    const { driverId } = req.params;
    const serviceBooking = await ServiceBooking.find({ driverId }).populate({
      path: "mechanicId",
      select: "_id",
      populate: {
        path: "businessDetails",
        select: "-_id picture businessName businessPhoneNumber businessEmail",
      },
    });;

    res.status(200).json({
      success: true,
      message: "Driver bookings fetched successfully.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get all bookings
exports.getAllBooking = async (req, res) => {
  try {
    const serviceBooking = await ServiceBooking.find().sort({ createdAt: -1 })
    .populate({
        path: "driverId", 
        select: "fullName phoneNumber email",
        populate: {
            path: "profileImage",
            select: "-_id image"
        }
    })
    .populate({
        path:"mechanicId", 
        select: "_id",
        populate: {
            path: "businessDetails",
            select: "-_id picture businessName businessPhoneNumber businessEmail"
        }
    });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully.",
      serviceBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
