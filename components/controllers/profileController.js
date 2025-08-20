const Profile = require("../models/userProfile");
const cloudinary = require("../middleware/cloudinary");
const User = require("../models/usersModel");

// edit user profile
exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, phoneNumber } = req.body;

        let image;
        if(!req.file){
            image = "https://res.cloudinary.com/dxukqrach/image/upload/v1755659996/profile_adx9dd.png"
        }
        else {
            const imageURL = await cloudinary.uploader.upload(req.file.path, {
                folder: "autopadi",
                resource_type: "auto"
            });
            image = imageURL.secure_url;
        }

        const profile = await Profile.findOneAndUpdate(
          { userId },
          { image, fullName, email, phoneNumber },
          { new: true }
        );
        
        if(!profile){
            return res.status(404).json({
                success: false,
                message: "profile not found."
            });
        }

        // update for user account
        const user = await User.findByIdAndUpdate(
          { _id: userId },
          { fullName: profile.fullName, email: profile.email, phoneNumber: profile.phoneNumber },
          { new: true }
        );


        res.status(200).json({
            success: true,
            message: "profile updated successfully.",
            profile,
            user,
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

// get user profile by id
exports.getUserProfile = async  (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await Profile.findOne({userId});

        // if user is not found
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "profile retrieved successfully",
            profiles: profile
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        })
    }
};

// get all profile
exports.getAllProfile = async (req, res) => {
    try {
      const profile = await Profile.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: "profile retrieved successfully",
        profiles: profile,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal server error: ${error.message}`,
      });
    }
};