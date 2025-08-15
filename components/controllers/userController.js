const bcrypt = require("bcryptjs");
const User = require("../models/usersModel");
const { generateToken } = require("../middleware/authenticate");

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
    await user.save();

    res.status(201).json({
      message: "account created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
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
    });
  } catch (err) {
    res.status(500).json({ message: `Server error ${err.message}` });
  }
};
