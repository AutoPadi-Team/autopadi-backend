const cloudinary = require("../middleware/cloudinary");
const BusinessProfile = require("../models/businessProfile");
const ServicePlanSubscription = require("../models/ServicePlanSubscriptionModel")
const MechanicServicePlan = require("../models/mechanicServicePlanModel")
const User = require("../models/usersModel");

// Create business profile
exports.createBusinessProfile = async (req, res) => {
  try {
    const {
      mechanicId,
      mechanicType,
      businessName,
      businessPhoneNumber,
      businessEmail,
      yearsOfExperience,
      brandServiced,
      aboutBusiness,
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
      businessName,
      businessPhoneNumber,
      businessEmail,
      yearsOfExperience,
      brandServiced: brandServiced.split(",").map((item) => item.trim()),
      aboutBusiness,
      certificate: documentCertificate.secure_url,
      location,
      servicesOffered: servicesOffered.split(",").map((item) => item.trim()),
      picture: image.secure_url,
      paymentMethod: paymentMethod.split(",").map((item) => item.trim()),
      rating: 1,
    });
    const savedBusinessProfile = await business.save();

    // update user with businessDetails
    const user = await User.findByIdAndUpdate(
      savedBusinessProfile.mechanicId,
      { businessDetails: savedBusinessProfile._id },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(201).json({
      success: true,
      message: "business profile created successfully.",
      savedBusinessProfile,
      user: user.businessDetails,
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
    const {
      mechanicType,
      businessName,
      businessPhoneNumber,
      businessEmail,
      yearsOfExperience,
      brandServiced,
      aboutBusiness,
      location,
      servicesOffered,
      paymentMethod,
    } = req.body;

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
        businessName,
        businessPhoneNumber,
        businessEmail,
        yearsOfExperience,
        brandServiced: brandServiced.split(",").map((item) => item.trim()),
        aboutBusiness,
        certificate: documentCertificate.secure_url,
        location,
        servicesOffered: servicesOffered.split(",").map((item) => item.trim()),
        picture: image.secure_url,
        paymentMethod: paymentMethod.split(",").map((item) => item.trim()),
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

    // mechanics service plans
    const existingMechanicServicePlan = await MechanicServicePlan.find({ mechanic: mechanicId }).populate("package");

    // find mechanic's customers active service plan subscription
    const existingServicePlanSubscription = await ServicePlanSubscription.find({
      mechanicId,
      subscriptionStatus: true,
    }).populate("packageId").populate("driverId", "fullName phoneNumber");

    res.status(200).json({
      success: true,
      message: "business profile fetched successfully.",
      businessProfile,
      mechanicServicePlan: existingMechanicServicePlan,
      customersSubscribedServicePlans: existingServicePlanSubscription,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

// get all business profiles whose verified is true
exports.getAllBusinessProfilesVerified = async (req, res) => {
  try {
    const businessProfiles = await BusinessProfile.find({
      verified: true,
    }).sort({
      rating: -1,
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

// verify business profile(admin)
exports.verifyBusinessProfile = async (req, res) => {
  try {
    const { mechanicId } = req.params;

    const businessProfile = await BusinessProfile.findOne({ mechanicId });
    if (!businessProfile) {
      return res.status(404).json({
        success: false,
        message: "business profile not found",
      });
    }

    if (businessProfile.verified === true) {
      return res.status(400).json({
        success: false,
        message: "business profile already verified",
      });
    };

    const verifiedBusinessProfile = await BusinessProfile.findOneAndUpdate(
      { mechanicId },
      { verified: true, rating: 3 },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "business profile verified successfully.",
      businessProfile: {
        id: verifiedBusinessProfile._id,
        verified: verifiedBusinessProfile.verified,
        rating: verifiedBusinessProfile.rating,
      }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};