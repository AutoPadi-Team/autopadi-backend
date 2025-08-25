const { updateProfile, getUserProfile, getAllProfile, } = require("../controllers/profileController");
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authenticate");
const upload = require("../middleware/multer");

router.put("/update-profile/:userId", verifyToken, upload.single("image"), updateProfile); // update user profile
router.get("/user-profile/:userId", verifyToken, getUserProfile); // get user profile by user id
router.get("/users-profile", verifyToken, getAllProfile); // get all profiles

module.exports = router;