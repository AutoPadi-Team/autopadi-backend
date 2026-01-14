const { sendMechanicRequest, getDriversRequest, getAllDriversRequest } = require("../controllers/requestConnectionController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.post("/send-request/:mechanicId", verifyToken, sendMechanicRequest); // Send mechanic request
router.get("/get-requests/:mechanicId", verifyToken, getDriversRequest); // Get drivers request
router.get("/get-all-requests", verifyToken, getAllDriversRequest); // Get all drivers request

module.exports = router;