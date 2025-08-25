const router = require("express").Router();
const upload = require("../middleware/multer");
const { createBusinessProfile, updateBusinessProfile, getBusinessProfile, getAllBusinessProfiles } = require("../controllers/businessProfileController");
const { verifyToken } = require("../middleware/authenticate");


router.post(
  "/create-business-profile",
  verifyToken,
  upload.fields([
    { name: "picture", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  createBusinessProfile
); // create business profile
router.put(
  "/update-business-profile/:mechanicId",
  verifyToken,
  upload.fields([
    { name: "picture", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
updateBusinessProfile); // update business profile
router.get("/get-business-profile/:mechanicId", verifyToken, getBusinessProfile) // get business profile
router.get("/get-business-profile", verifyToken, getAllBusinessProfiles); // get all business profile

module.exports = router;