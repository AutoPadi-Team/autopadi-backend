const cloudinary = require("../middleware/cloudinary");
const BusinessProfile = require("../models/businessProfile");
const Profile = require("../models/userProfile");

// Create business profile
exports.createBusinessProfile = async (req, res) => {
  try {
    const {
      mechanicId,
      mechanicType,
      location,
      servicesOffered,
      paymentMethod,
    } = req.body;

    const businessProfile = await BusinessProfile.findOne({ mechanicId });
    if (businessProfile) {
      return res.status(404).json({
        success: false,
        message: "Information already submitted",
      });
    }

    if (!req.files) {
      return res.status(404).json({
        success: false,
        message: "No files received, try again",
      });
    }

    // check if there is no file in picture field
    const pictureFile = req.files["picture"];
    if (!pictureFile) {
      return res.status(404).json({
        success: false,
        message: "No picture received, try again",
      });
    }

    // check if there is no file in picture field
    const certificateFile = req.files["certificate"];
    if (!certificateFile) {
      return res.status(404).json({
        success: false,
        message: "No certificate received, try again",
      });
    }

    // accept certificate
    const documentCertificate = await cloudinary.uploader.upload(
      certificateFile[0].path,
      {
        folder: "autopadi",
        resource_type: "auto",
      }
    );

    // accept image only
    const image = await cloudinary.uploader.upload(pictureFile[0].path, {
      folder: "autopadi",
      resource_type: "image",
    });

    const business = new BusinessProfile({
      mechanicId,
      mechanicType,
      certificate: documentCertificate.secure_url,
      location,
      servicesOffered,
      picture: image.secure_url,
      paymentMethod,
    });
    const savedBusinessProfile = await business.save();

    // update user profile with businessId
    const profile = await Profile.findOneAndUpdate(
      { userId: savedBusinessProfile.mechanicId },
      { businessId: savedBusinessProfile._id },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    res.status(201).json({
      success: true,
      message: "business profile created successfully.",
      savedBusinessProfile,
      profile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Update business profile
exports.updateBusinessProfile = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const { mechanicType, location, servicesOffered, paymentMethod } = req.body;

    const businessProfile = await BusinessProfile.findOne({ mechanicId });
    if (!businessProfile) {
      return res.status(404).json({
        success: false,
        message: "data already submitted",
      });
    }

    // check if there is no file in picture field
    const pictureFile = req.files["picture"];
    if (!pictureFile) {
      return res.status(404).json({
        success: false,
        message: "no picture received, try again",
      });
    }

    // check if there is no file in picture field
    const certificateFile = req.files["certificate"];
    if (!certificateFile) {
      return res.status(404).json({
        success: false,
        message: "no certificate received, try again",
      });
    }

    // accept certificate
    const documentCertificate = await cloudinary.uploader.upload(
      certificateFile[0].path,
      {
        folder: "autopadi",
        resource_type: "auto",
      }
    );

    // accept image only
    const image = await cloudinary.uploader.upload(pictureFile[0].path, {
      folder: "autopadi",
      resource_type: "image",
    });

    const business = await BusinessProfile.findOneAndUpdate(
      { mechanicId },
      {
        mechanicType,
        certificate: documentCertificate.secure_url,
        location,
        servicesOffered,
        picture: image.secure_url,
        paymentMethod,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "business profile updated successfully.",
      business,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// Get business profile by mechanicId
exports.getBusinessProfile = async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const businessProfile = await BusinessProfile.findOne({ mechanicId });
    if (!businessProfile) {
      return res.status(404).json({
        success: false,
        message: "business profile not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "business profile fetched successfully.",
      businessProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// get all business profiles
exports.getAllBusinessProfiles = async (req, res) => {
  try {
    const businessProfiles = await BusinessProfile.find().sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "business profiles fetched successfully.",
      businessProfiles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
