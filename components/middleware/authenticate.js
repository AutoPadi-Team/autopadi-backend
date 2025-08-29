const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

// Function to generate a random token
exports.generateToken = (user) => {
  const payload = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, secretKey, {
    expiresIn: "1d",
  });
  return token;
};

// Function to generate a random refresh token
exports.generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, refreshSecretKey, {
    expiresIn: "120d",
  });

  return token;
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = decoded;
    next();
  });
};
