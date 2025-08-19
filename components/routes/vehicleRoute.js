const { addVehicle } = require("../controllers/vehicleController");
const express = require("express");
const { verifyToken } = require("../middleware/authenticate");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/create-vehicle-profile", verifyToken, upload.single("image"), addVehicle); // create vehicle profile

module.exports = router;
