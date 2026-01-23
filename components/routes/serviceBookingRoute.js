const { bookService, declineBookService, acceptBookService, cancelBookService, driverCancelBookService,completeBookService, getDriverBooking, getMechanicBooking, getAllBooking  } = require("../controllers/serviceBookingController");
const { verifyToken } = require("../middleware/authenticate");
const router = require("express").Router();

router.post("/book-service", verifyToken, bookService); // book new service
router.put("/decline-booking/:id", verifyToken, declineBookService) // decline booking service
router.put("/accept-booking/:id", verifyToken, acceptBookService) // accept booking service
router.put("/cancel-booking/:id", verifyToken, cancelBookService) // cancel booking service
router.put("/driver-cancel-booking/:id", verifyToken, driverCancelBookService); // cancel booking service
router.put("/complete-booking/:id", verifyToken, completeBookService) // complete booking service
router.get("/fetch-driver-bookings/:driverId", verifyToken, getDriverBooking) // get driver booking service
router.get("/fetch-mechanic-bookings/:mechanicId", verifyToken, getMechanicBooking) // get mechanic booking service
router.get("/fetch-all-bookings", verifyToken, getAllBooking) // get mechanic booking service

module.exports = router;
