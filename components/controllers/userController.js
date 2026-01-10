const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const {
  generateToken,
  generateRefreshToken,
} = require("../middleware/authenticate");
const { sendMail } = require("../mailer/sendMail");
const verificationCode = require("../models/verificationCode");
const userProfile = require("../models/userProfile");
const InactiveUser = require("../models/inactiveUser");
const MechanicServiceSubscriptionBalance = require("../models/mechanicSubscriptionBalanceModel");
const smsSender = require("../smsSender/smsSender");

// generate a verification code
const generateVerificationCode = () => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!email.includes("@")) {
      return res.status(404).json({
        success: false,
        message: `${email} is not a valid email.`,
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email or phone number already in use." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      rating: 3,
      password: hashedPassword,
    });
    const savedUser = await user.save();

    // create a profile
    const profile = new userProfile({
      userId: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
    });
    const savedProfile = await profile.save();

    // Generate JWT
    const token = generateToken(user);

    // generate refresh token
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
    });

    // save date of the refresh token expiry
    savedUser.refreshTokenExpiredAt = new Date(
      Date.now() + 120 * 24 * 60 * 60 * 1000
    ); // 120 days from now
    await savedUser.save();

    // save the verification code
    const generatedCode = generateVerificationCode();
    const verifyCode = new verificationCode({
      name: savedUser.fullName,
      email: savedUser.email,
      code: generatedCode,
    });
    await verifyCode.save();

    // Send email
    // const mailInfo = await sendMail({
    //   email: savedUser.email,
    //   subject: "Verification Code",
    //   html: `
    //       <div style=" background-color:#fff;">
    //         <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
    //             <div style="text-align:center;padding-bottom:20px; display: flex;">
    //               <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
    //               <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
    //             </div>
    //             <div style="padding-bottom:10px;text-align:left;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     Dear <span style="font-weight:600;">${savedUser.fullName}</span>,
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:18px;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     To confirm your account, please verify your email address using the code below.
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:22px;">
    //                 <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
    //                     ${generatedCode}
    //                 </span>
    //             </div>
    //             <div style="text-align:center;padding-bottom:10px;">
    //                 <p style="color: #474747;font-size:15px;margin:0;">
    //                     This code will expire in <strong>10 minutes time</strong>
    //                 </p>
    //                 <p style="color:#888;font-size:13px;margin:0;">
    //                     Didn’t log in ? You can safely ignore this email.
    //                 </p>
    //             </div>
    //         </div>
    //     </div>
    //   `,
    // });

    // Send sms
    const smsInfo = await smsSender({
      name: savedUser.fullName,
      phoneNumber: savedUser.phoneNumber,
      code: verifyCode.code,
    });

    res.status(201).json({
      message: "account created successfully",
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
      profile: savedProfile.image,
      token,
      // info: mailInfo.response,
      smsInfo,
    });

  } catch (err) {
    res.status(500).json({ message: `Server error ${err.message}` });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // Check password
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch)
    //   return res.status(400).json({ message: "Invalid credentials." });

    // save the verification code
    const generatedCode = generateVerificationCode();
    const verifyCode = new verificationCode({
      email: user.email,
      code: generatedCode,
    });
    const codeSaved = await verifyCode.save();

    // Send email
    // const mailInfo = await sendMail({
    //   email: user.email,
    //   subject: "Verification Code",
    //   html: `
    //       <div style=" background-color:#fff;">
    //         <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
    //             <div style="text-align:center;padding-bottom:20px; display: flex;">
    //               <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
    //               <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
    //             </div>
    //             <div style="padding-bottom:10px;text-align:left;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     Dear <span style="font-weight:600;">${user.fullName}</span>,
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:18px;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     To confirm your account, please verify your email address using the code below.
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:22px;">
    //                 <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
    //                     ${codeSaved.code}
    //                 </span>
    //             </div>
    //             <div style="text-align:center;padding-bottom:10px;">
    //                 <p style="color: #474747;font-size:15px;margin:0;">
    //                     This code will expire in <strong>10 minutes time</strong>
    //                 </p>
    //                 <p style="color:#888;font-size:13px;margin:0;">
    //                     Didn’t log in ? You can safely ignore this email.
    //                 </p>
    //             </div>
    //         </div>
    //     </div>
    //   `,
    // });

    // Send sms
    const smsInfo = await smsSender({
      name: user.fullName,
      phoneNumber: user.phoneNumber,
      code: codeSaved.code,
    });

    // Generate JWT
    const token = generateToken(user);

    // generate refresh token
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
    });

    // save date of the refresh token expiry
    user.refreshTokenExpiredAt = new Date(
      Date.now() + 120 * 24 * 60 * 60 * 1000
    ); // 120 days from now
    await user.save();

    res.json({
      success: true,
      message: "logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        role: user.role,
        premiumMember: user.premiumMember,
        connectors: user.connectors,
        connectorsCount: user.connectorsCount,
        connected: user.connected,
        connectedCount: user.connectedCount,
        createdAt: user.createdAt,
      },
      // info: mailInfo.response,
      smsInfo,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// Verify user email with code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find verification code
    const verification = await verificationCode.findOne({ email, code });
    if (!verification) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // If code is valid, delete it
    await verificationCode.deleteOne({ email, code });
    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email, rating: 5 },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: "Email verified successfully.",
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        rating: user.rating,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.params;

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    // If code is valid, delete it
    await verificationCode.deleteOne({ email });

    // Generate new verification code
    const generatedCode = generateVerificationCode();
    const verifyCode = new verificationCode({
      email: user.email,
      code: generatedCode,
    });
    await verifyCode.save();

    // Send email
    // const mailInfo = await sendMail({
    //   email: user.email,
    //   subject: "Resend Verification Code",
    //   html: `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <title>Verification Code</title>
    //     </head>
    //     <body>
    //       <div style=" background-color:#fff;">
    //         <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
    //             <div style="text-align:center;padding-bottom:20px; display: flex; align-items: center; justify-content: center;">
    //               <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
    //               <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
    //             </div>
    //             <div style="padding-bottom:10px;text-align:left;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     Dear <span style="font-weight:600;">${user.fullName}</span>,
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:18px;">
    //                 <p style="color:#444;font-size:16px;margin:0;">
    //                     To confirm your account, please verify your email address using the code below.
    //                 </p>
    //             </div>
    //             <div style="text-align:center;padding-bottom:22px;">
    //                 <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
    //                     ${generatedCode}
    //                 </span>
    //             </div>
    //             <div style="text-align:center;padding-bottom:10px;">
    //                 <p style="color: #474747;font-size:15px;margin:0;">
    //                     This code will expire in <strong>10 minutes time</strong>
    //                 </p>
    //                 <p style="color:#888;font-size:13px;margin:0;">
    //                     Didn’t log in ? You can safely ignore this email.
    //                 </p>
    //             </div>
    //         </div>
    //     </div>
    //     </body>
    //     </html>

    //   `,
    // });

    // Send sms
    const smsInfo = await smsSender({
      name: user.fullName,
      phoneNumber: user.phoneNumber,
      code: verifyCode.code,
    });

    res.json({
      message: "Verification code resent successfully.",
      smsInfo,
      // mailInfo,
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// check user role
exports.userRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    let mechanicAccount;
    //create a payment account for mechanic
    if (user.role === "mechanic") {
      const existingAccount = await MechanicServiceSubscriptionBalance.findOne({ mechanicId: user._id });
      if (existingAccount) {
        return res.status(400).json({ 
          success: false, 
          message: "User role is a mechanic and account balance already exists  " 
        });
      }
      const mechanicServiceSubscriptionBalance = new MechanicServiceSubscriptionBalance({
        mechanicId: user._id,
        balanceAmount: 0,
      });
      mechanicAccount = await mechanicServiceSubscriptionBalance.save();
    }

    res.status(200).json({
      success: true,
      message: "user role selected successfully",
      user: {
        fullName: user.fullName,
        role: user.role,
        mechanicAccount: mechanicAccount || null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// add user location
exports.userLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    const user = await User.findByIdAndUpdate(id, { location }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "location accepted successfully",
      user: {
        fullName: user.fullName,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// add fingerprint id
exports.addFingerPrintId = async (req, res) => {
  try {
    const { id } = req.params;
    const { fingerPrintId } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const updatedUser = user.fingerPrintId = fingerPrintId;
    await user.save();

    res.status(200).json({
      success: true,
      message: "fingerprint added successfully",
      user: {
        fullName: user.fullName,
        fingerPrintId: updatedUser,
      },
    });
    
  } catch (error) {
    res.status(500).json({ success:false, message: `Internal server error: ${error.message}` });
  }
};

// get user location by id
exports.getUserLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "location retrieved successfully",
      location: user.location,
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// get all users data
exports.getAllUserDetails = async (req, res) => {
  try {
    const user = await User.find().select("-password").sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "users not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "users retrieved successfully",
      users: user,
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// get user data by id
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      .populate("profileImage", "image")
      .populate("businessDetails")
      .populate({
        path: "connectors",
        select: "fullName email phoneNumber location isVerified role",
        populate: { path: "profileImage", select: "image" },
      })
      .populate({
        path: "connected",
        select: "fullName email phoneNumber location isVerified role",
        populate: { path: "profileImage", select: "image" },
      });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "user retrieved successfully",
      userDetails: user,
    });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// delete user data
exports.deleteUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    // store inactive user data
    const inactiveUser = new InactiveUser({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profileImage: user.profileImage,
      connectors: user.connectors,
      connectorsCount: user.connectorsCount,
      connected: user.connected,
      connectedCount: user.connectedCount,
      reason: reason.split(",").map((item) => item.trim()),
    });
    await inactiveUser.save();

    res.status(200).json({
      success: true,
      message: `${user.fullName} account deleted successfully 😊`,
      inactiveUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// get all deleted users account
exports.getAllInactiveUsers = async (req, res) => {
  try {
    const users = await InactiveUser.find()
      .populate("profileImage", "image", { strictPopulate: false })
      .populate("businessDetails", null, { strictPopulate: false })
      .populate("connectors", "fullName email phoneNumber location isVerified role", { strictPopulate: false })
      .populate("connected", "fullName email phoneNumber location isVerified role", { strictPopulate: false })
      .sort({ createdAt: -1 });
    if (!users) {
      return res.status(404).json({
        success: false,
        message: "no inactive users found",
      });
    }

    res.status(200).json({
      success: true,
      message: "inactive users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
};

// generate new token
exports.generateNewToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided." });
    }

    // verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    if (!decoded) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid token." });
    }

    // check if user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // check if refresh token is close to expiry (3 days)
    if (user.refreshTokenExpiredAt - Date.now() < 3 * 24 * 60 * 60 * 1000) {
      const newRefreshToken = generateRefreshToken(user);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
      });

      // update refresh token expiry date
      user.refreshTokenExpiredAt = new Date(
        Date.now() + 120 * 24 * 60 * 60 * 1000
      ); // 120 days from now
      await user.save();
    }

    // generate new token
    const newToken = generateToken(user);
    res.status(200).json({
      message: "New token generated successfully",
      token: newToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
};
