const {
  createUrgentRequest,
  declineUrgentRequest,
  acceptUrgentRequest,
  cancelUrgentRequest,
  driverCancelUrgentRequest,
  completeUrgentRequest,
  getAllRequest,
} = require("../controllers/urgentRequestController");
const { verifyToken } = require("../middleware/authenticate");
const express = require("express");
const router = express.Router();

router.post("/create-request", verifyToken, createUrgentRequest); // driver creates urgent request  
router.put("/decline-request/:id", verifyToken, declineUrgentRequest); // mechanic declines urgent request
router.put("/accept-request/:id", verifyToken, acceptUrgentRequest);  // mechanic accepts urgent request
router.put("/cancel-request/:id", verifyToken, cancelUrgentRequest);  // mechanic cancels urgent request
router.put("/driver-cancel-request/:id", verifyToken, driverCancelUrgentRequest);  // driver cancels urgent request
router.put("/complete-request/:id", verifyToken, completeUrgentRequest);  // driver completes urgent request
router.get("/all-requests", verifyToken, getAllRequest); // get all urgent requests

module.exports = router;
