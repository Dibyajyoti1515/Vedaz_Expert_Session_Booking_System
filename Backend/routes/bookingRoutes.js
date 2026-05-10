const express = require("express");
const {
    createBooking,
    getMyBookings,
    updateBookingStatus,
    getAllBookings,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);  // user
router.get("/", protect, getMyBookings);  // user
router.get("/all", protect, adminOnly, getAllBookings); // admin
router.patch("/:id/status", protect, adminOnly, updateBookingStatus); // admin

module.exports = router;