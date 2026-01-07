const User = require("../models/usersModel");

// get all available mechanics locations
exports.getAllMechanicsLocations = async (req, res) => {
    try {
        const mechanics = await User.find({
          role: "mechanic",
          availability: true,
        })
          .select("location availability availabilityTime fullName phoneNumber profileImage businessDetails")
          .populate("businessDetails", "mechanicType businessName")
          .populate("profileImage", "image");

        res.status(200).json({
            success: true,
            message: "Mechanics locations retrieved successfully",
            mechanics,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        })
    }
};

// update mechanic availability status and time
exports.updateAvailability = async (req, res) => {
    const { availability } = req.body;
    const userId = req.params.id;

    try {
        // Find user by ID and update availability
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { availability },
            { new: true }
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
}

// update mechanic availability time
exports.updateAvailabilityTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { from, to } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { availabilityTime: { from, to } },
            { new: true }
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