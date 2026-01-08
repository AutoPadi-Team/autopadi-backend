const router = require("express").Router();
const { getAllMechanicsLocations, getMechanicAvailabilityStatusAndTime, updateAvailability, updateAvailabilityTime } = require("../controllers/locationController");
const { verifyToken } = require("../middleware/authenticate");

router.get("/mechanics-locations", verifyToken, getAllMechanicsLocations); // get all available mechanics locations
router.get("/mechanic-availability-time/:id", verifyToken, getMechanicAvailabilityStatusAndTime); // get mechanic availability status and time
router.patch("/update-availability/:id", verifyToken, updateAvailability); // update mechanic availability status
router.patch("/update-availability-time/:id", verifyToken, updateAvailabilityTime); // update mechanic availability time

module.exports = router;