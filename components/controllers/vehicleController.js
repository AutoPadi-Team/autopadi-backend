const Vehicle = require("../models/vehicleModel");
const User = require("../models/usersModel");
const cloudinary = require("../middleware/cloudinary");

// add a vehicle profile
exports.addVehicle = async (req, res) => {
  try {
    const { driverId, carBrand, carModel, carYear, carLicensePlateNumber, carColor } = req.body;

    // check if the image is empty
    let image;
    if (!req.file) {
      image =
        "https://res.cloudinary.com/dxukqrach/image/upload/v1755561679/ChatGPT_Image_Aug_17_2025_06_32_12_PM_o3sfqx.png";
    } else {
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "autopadi",
        resource_type: "auto",
      });
      image = imageResult.secure_url;
    }

    // create a vehicle data
    const userVehicle = new Vehicle({
      driverId,
      image,
      carBrand,
      carModel,
      carYear,
      carLicensePlateNumber,
      carColor,
    });
    const savedVehicle = await userVehicle.save();

    res.status(200).json({
      success: true,
      message: "vehicle profile created successfully",
      vehicleDetails: savedVehicle,
    });
  } catch (error) {
    console.error(`Internal server error: ${error.message}`);

    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get all vehicles
exports.getAllUserVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.find().sort({ createdAt: -1 }).populate({
      path: "driverId",
      select: "fullName email phoneNumber",
      populate: { path: "profileImage", select: "-_id image" },
    });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "vehicles not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "vehicles retrieved successfully",
      vehicles: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get user's vehicle
exports.getUserVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.find({ driverId: id });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "vehicle retrieved successfully",
      vehicles: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// update user's vehicle
exports.updateUserVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { carBrand, carModel, carYear, carLicensePlateNumber, carColor } = req.body;

    // check if the image is empty
    let image;
    if (!req.file) {
      image = "https://res.cloudinary.com/dxukqrach/image/upload/v1755561679/ChatGPT_Image_Aug_17_2025_06_32_12_PM_o3sfqx.png";
    } else {
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "autopadi",
        resource_type: "auto",
      });
      image = imageResult.secure_url;
    };

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        carBrand,
        carModel,
        carYear,
        carLicensePlateNumber,
        carColor,
        image,
      },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "vehicle not found",
      })
    };

    res.status(200).json({
      success: true,
      message: "vehicle edited successfully",
      vehicles: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// delete user's vehicle
exports.deleteUserVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndDelete(id);
    if(!vehicle){
      return res.status(404).json({
        success: false,
        message: "vehicle not found"
      })
    }

    res.status(200).json({
      success: true,
      message: `${vehicle.carBrand} deleted successfully`,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
}