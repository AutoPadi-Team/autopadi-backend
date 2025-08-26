const router = require("express").Router();
const { connectMechanic, disconnectMechanic, getConnectedMechanics, getConnectedDrivers } = require("../controllers/connectController");
const { verifyToken } = require("../middleware/authenticate");

router.post("/connect-mechanic/:mechanicId", verifyToken, connectMechanic); // connect mechanic
router.post("/disconnect-mechanic/:mechanicId", verifyToken, disconnectMechanic); // disconnect mechanic
router.get("/connected-mechanics", verifyToken, getConnectedMechanics); // get connected mechanics for drivers
router.get("/connected-drivers", verifyToken, getConnectedDrivers); // get connected drivers for mechanics

module.exports = router;