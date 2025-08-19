const { addVehicle, updateUserVehicle, getUserVehicle, getAllUserVehicle, deleteUserVehicle } = require("../controllers/vehicleController");
const express = require("express");
const { verifyToken } = require("../middleware/authenticate");
const upload = require("../middleware/multer");
const router = express.Router();

router.post("/create-vehicle-profile", verifyToken, upload.single("image"), addVehicle); // create vehicle profile
router.put("/user-vehicle/:id", verifyToken, upload.single("image"), updateUserVehicle); // edit vehicle profile
router.get("/user-vehicles", verifyToken, getAllUserVehicle); // retrieve all vehicles
router.get("/user-vehicle/:id", verifyToken, getUserVehicle); // retrieve user vehicle
router.delete("/delete-vehicle/:id", verifyToken, deleteUserVehicle); //delete user vehicle

module.exports = router;
