const { register, login, verifyEmail, resendVerificationCode, userRole, userLocation, getUserLocation, getUserDetails } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.post("/register", register); // Register a new user
router.post("/login", login); // Login user
router.post("/verify-email", verifyToken, verifyEmail); // Verify user email
router.post("/resend-verification-code/:email", verifyToken, resendVerificationCode); // Resend verification code
router.patch("/select-role/:id", verifyToken, userRole); // select user role
router.patch("/add-location/:id", verifyToken, userLocation); // add user location
router.get("/get-location/:id", verifyToken, getUserLocation) // get user location
router.get("/user-details/:id", verifyToken, getUserDetails); // retrieve user details

module.exports = router;
