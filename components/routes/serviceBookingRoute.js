const {
  bookService,
  declineBookService,
  acceptBookService,
  cancelBookService,
  driverCancelBookService,
  completeBookService,
  getDriverBooking,
  getMechanicBooking,
  getAllBooking,
} = require("../controllers/serviceBookingController");
const { verifyToken } = require("../middleware/authenticate");
const router = require("express").Router();

/**
 * @swagger
 * tags:
 *   name: Service Bookings
 *   description: Service booking management with socket integration for real-time updates with drivers and mechanics
 */

/**
 * @swagger
 * /api/decline-booking/{id}:
 *   put:
 *     summary: Decline a service
 *     tags: [Service Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service booked successfully
 *       404:
 *         description: Your service booked is pending/accepted
 */
router.post("/book-service", verifyToken, bookService); // book new service

/**
 * @swagger
 * /api/book-service:
 *   put:
 *     summary: Decline a service
 *     tags: [Service Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId, mechanicId, vehicleInfo, issue, date, location]
 *             properties:
 *               driverId:
 *                 type: string
 *               mechanicId:
 *                 type: string
 *               vehicleInfo:
 *                 type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                   carBrand:
 *                     type: string
 *                   carModel:
 *                     type: string
 *                   carYear:
 *                     type: string
 *                   carLicensePlateNumber:
 *                     type: string
 *                   carColor:
 *                     type: string
 *               issue:
 *                 type: string
 *               date:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   addressName:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *     responses:
 *       201:
 *         description: Service booked successfully
 *       404:
 *         description: Your service booked is pending/accepted
 */
router.put("/decline-booking/:id", verifyToken, declineBookService); // decline booking service
router.put("/accept-booking/:id", verifyToken, acceptBookService); // accept booking service
router.put("/cancel-booking/:id", verifyToken, cancelBookService); // cancel booking service
router.put("/driver-cancel-booking/:id", verifyToken, driverCancelBookService); // cancel booking service
router.put("/complete-booking/:id", verifyToken, completeBookService); // complete booking service
router.get("/fetch-driver-bookings/:driverId", verifyToken, getDriverBooking); // get driver booking service
router.get("/fetch-mechanic-bookings/:mechanicId", verifyToken, getMechanicBooking,); // get mechanic booking service
router.get("/fetch-all-bookings", verifyToken, getAllBooking); // get mechanic booking service

module.exports = router;
