const User = require("../models/usersModel");
const h3 = require("h3-js");

// get near by available mechanics locations
exports.getAllNearbyMechanicsLocations = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // convert driver location to H3 index at resolution 8
    const driverH3Index = h3.latLngToCell(parseFloat(lat), parseFloat(lon), 8);
    // Get nearby H3 indexes within a certain radius 2 hex cells
    const nearbyH3Indexes = h3.gridDisk(driverH3Index, 2);

    const mechanics = await User.find({
      h3Index: { $in: nearbyH3Indexes },
      role: "mechanic",
      availability: true,
      businessVerified: true,
    })
      .select(
        "fullName phoneNumber location availability availabilityTime rating h3Index",
      )
      .populate("profileImage", "image")
      .sort({ rating: -1 })
      .limit(5);

    //fetch mechanics only h3 indexes
    const mechanicsH3Indexes = mechanics.map((mechanic) => mechanic.h3Index);
    // calculate step hex distance from driver to each mechanic
    const stepDistanceH3 = mechanicsH3Indexes.map((mechH3Index) => {
      return h3.gridDistance(driverH3Index, mechH3Index);
    });
    // calculate approx. meters distance per hex at res 8
    const metersDistances = stepDistanceH3.map((step) => step * 650);
    // calculate estimated time in minutes assuming avg speed of 16.67 m/min (1 km in 60 mins)
    const speedMinutes = 16.67 * 30;
    // calculate estimated time in minutes for each mechanic
    const estimatedTimes = metersDistances.map((meters) =>
      Math.floor(parseFloat(meters) / parseFloat(speedMinutes)),
    );

    const mechanicWithEta = mechanics.map((mech, index) => {
      const etaMinutes = Math.floor(parseFloat(metersDistances[index]) / parseFloat(speedMinutes));
      return {
        ...mech.toObject(),
        etaMinutes
      }
    })

    res.status(200).json({
      success: true,
      message: "Mechanics locations retrieved successfully",
      mechanics: mechanicWithEta,
      // etaMinutes: estimatedTimes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get mechanic available status and time
exports.getMechanicAvailabilityStatusAndTime = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mechanic availability status and time retrieved successfully",
      availability: user.availability,
      availabilityTime: user.availabilityTime,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// update mechanic availability status
exports.updateAvailability = async (req, res) => {
  const { availability } = req.body;
  const userId = req.params.id;

  try {
    // Find user by ID and update availability
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// update mechanic availability time
exports.updateAvailabilityTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { availabilityTime: { from, to } },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Mechanic not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Availability time updated successfully",
      availabilityTime: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};
