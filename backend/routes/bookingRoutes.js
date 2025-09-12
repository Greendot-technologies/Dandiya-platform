const express = require("express");
const router = express.Router();
const {
  createBooking,
  addUserDetails,
  createPayment,
  confirmPayment,
  getQRDetails,
  markTicketUsed,
} = require("../controllers/bookingController");

// Existing routes
router.post("/booking", createBooking);
router.post("/user", addUserDetails);
router.post("/payment", createPayment);
router.post("/payment/confirm", confirmPayment);

// New routes for QR code functionality
router.post("/qr/details", getQRDetails);
router.post("/qr/mark-used", markTicketUsed);

module.exports = router;
