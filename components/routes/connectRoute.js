const router = require("express").Router();
const { connectMechanic, connectDriver, disconnectMechanic, disconnectDriver, getConnectedMechanics, getConnectedDrivers } = require("../controllers/connectController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/connect-mechanic/:mechanicId", verifyToken, connectMechanic); // connect mechanic
router.post("/connect-driver/:driverId", verifyToken, connectDriver); // connect driver
router.post("/disconnect-mechanic/:mechanicId", verifyToken, disconnectMechanic); // disconnect mechanic
router.post("/disconnect-driver/:driverId", verifyToken, disconnectDriver); // disconnect driver
router.get("/connected-mechanics/:driverId", verifyToken, getConnectedMechanics); // get connected mechanics for drivers
router.get("/connected-drivers/:mechanicId", verifyToken, getConnectedDrivers); // get connected drivers for mechanics

module.exports = router;