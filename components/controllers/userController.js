const bcrypt = require("bcryptjs");
const User = require("../models/usersModel");
const { generateToken } = require("../middleware/authenticate");
const { sendMail } = require("../mailer/sendMail");
const verificationCode = require("../models/verificationCode");

// generate a verification code
const generateVerificationCode = () => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return code;
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

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
      password: hashedPassword,
    });
    const savedUser = await user.save();

    // Generate JWT
    const token = generateToken(user);

    // save the verification code
    const generatedCode = generateVerificationCode();
    const verifyCode = new verificationCode({
      email: savedUser.email,
      code: generatedCode,
    });
    await verifyCode.save();

    // Send email
    const mailInfo = await sendMail({
      email: savedUser.email,
      subject: "Verification Code",
      html: `
          <div style=" background-color:#fff;">
            <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
                <div style="text-align:center;padding-bottom:20px; display: flex;">
                  <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
                  <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
                </div>
                <div style="padding-bottom:10px;text-align:left;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        Dear <span style="font-weight:600;">${savedUser.fullName}</span>,
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:18px;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        To confirm your account, please verify your email address using the code below.
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:22px;">
                    <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
                        ${generatedCode}
                    </span>
                </div>
                <div style="text-align:center;padding-bottom:10px;">
                    <p style="color: #474747;font-size:15px;margin:0;">
                        This code will expire in <strong>10 minutes time</strong>
                    </p>
                    <p style="color:#888;font-size:13px;margin:0;">
                        Didn’t log in ? You can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
      `,
    });

    res.status(201).json({
      message: "account created successfully",
      user: {
        id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
      },
      token,
      mailInfo,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error ${err.message}` });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // Generate JWT
    const token = generateToken(user);

    // save the verification code
    const generatedCode = generateVerificationCode();
    const verifyCode = new verificationCode({
      email: user.email,
      code: generatedCode,
    });
    const codeSaved = await verifyCode.save();

    // Send email
    const mailInfo = await sendMail({
      email: user.email,
      subject: "Verification Code",
      html: `
          <div style=" background-color:#fff;">
            <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
                <div style="text-align:center;padding-bottom:20px; display: flex;">
                  <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
                  <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
                </div>
                <div style="padding-bottom:10px;text-align:left;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        Dear <span style="font-weight:600;">${user.fullName}</span>,
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:18px;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        To confirm your account, please verify your email address using the code below.
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:22px;">
                    <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
                        ${generatedCode}
                    </span>
                </div>
                <div style="text-align:center;padding-bottom:10px;">
                    <p style="color: #474747;font-size:15px;margin:0;">
                        This code will expire in <strong>10 minutes time</strong>
                    </p>
                    <p style="color:#888;font-size:13px;margin:0;">
                        Didn’t log in ? You can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
      `,
    });

    res.json({
      success: false,
      message: "logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber,
      },
      code: codeSaved.code,
      mailInfo,
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
      { email },
      { isVerified: true },
      { new: true }
    );

    res.json({
      message: "Email verified successfully.",
      user: { id: user.isVerified },
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
    if (!user) return res.status(404).json({ message: "User not found." });

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
    const mailInfo = await sendMail({
      email: user.email,
      subject: "Resend Verification Code",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
        </head>
        <body>
          <div style=" background-color:#fff;">
            <div style="background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.07);padding:36px 28px;width:100%;font-family:Verdana,sans-serif;">
                <div style="text-align:center;padding-bottom:20px; display: flex; align-items: center; justify-content: center;">
                  <img src="https://r4lcfqu82x.ufs.sh/f/dD4aXXWLaAu6z1dEu3aGer3Id1LO4gB6EXfs9qZvnWJtpojF" style="width: 50px; height: 50px; background-color: #2F63FF; border-radius: 50%; margin-top: -8px; margin-right: 16px;"  alt="">
                  <h2 style="color:#2F63FF;margin:0;font-size:22px;font-weight:700;">AutoPadi Organisation</h2>
                </div>
                <div style="padding-bottom:10px;text-align:left;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        Dear <span style="font-weight:600;">${user.fullName}</span>,
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:18px;">
                    <p style="color:#444;font-size:16px;margin:0;">
                        To confirm your account, please verify your email address using the code below.
                    </p>
                </div>
                <div style="text-align:center;padding-bottom:22px;">
                    <span style="display:inline-block;background:#e3f2fd;border:2px dashed #2F63FF;border-radius:8px;padding:18px 36px;font-size:30px;letter-spacing:10px;color:#2F63FF;font-weight:900;">
                        ${generatedCode}
                    </span>
                </div>
                <div style="text-align:center;padding-bottom:10px;">
                    <p style="color: #474747;font-size:15px;margin:0;">
                        This code will expire in <strong>10 minutes time</strong>
                    </p>
                    <p style="color:#888;font-size:13px;margin:0;">
                        Didn’t log in ? You can safely ignore this email.
                    </p>
                </div>
            </div>
        </div>
        </body>
        </html>

      `,
    });
    res.json({
      message: "Verification code resent successfully.",
      code: generatedCode,
      mailInfo,
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

    res.status(200).json({
      success: true,
      message: "user role selected successfully",
      user: {
        fullName: user.fullName,
        role: user.role,
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
    const user = await User.find().select("-password").sort({ createdAt: -1});
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
    const user = await User.findById(id).select("-password");
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

// delete user date
exports.deleteUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user= await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    res.status(200).json({
      success: true,
      message: `${user.fullName} account deleted successfully 😊`
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    });
  }
}
