const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const generateQRCode = require("../utils/qrGenerator");
const generateTicketPDF = require("../utils/pdfGenerator");
const { sendTicketEmail } = require("../utils/emailService");
require("dotenv").config();

const router = express.Router();

// In-memory storage (replace with actual database)
let bookings = [];
let users = [];
let bookingCounter = 1000;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create booking
router.post("/booking", (req, res) => {
  try {
    const { booking_date, tickets, num_tickets } = req.body;

    if (!booking_date || !tickets || num_tickets === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking data" });
    }

    const bookingId = bookingCounter++;
    const newBooking = {
      id: bookingId,
      booking_date,
      tickets,
      num_tickets,
      status: "pending",
      created_at: new Date(),
    };

    bookings.push(newBooking);
    res.json({ success: true, booking: newBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create booking" });
  }
});

// Add user details
router.post("/user", (req, res) => {
  try {
    const { booking_id, name, email, phone } = req.body;

    if (!booking_id || !name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing user details" });
    }

    const booking = bookings.find((b) => b.id === booking_id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const newUser = {
      booking_id,
      name,
      email,
      phone,
      created_at: new Date(),
    };

    users.push(newUser);
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ success: false, message: "Failed to add user" });
  }
});

// Create payment order
router.post("/payment", async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    const booking = bookings.find((b) => b.id === booking_id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `booking_${booking_id}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create payment order" });
  }
});

// Confirm payment and send tickets
router.post("/payment/confirm", async (req, res) => {
  try {
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Find booking and user
    const booking = bookings.find((b) => b.id === booking_id);
    const user = users.find((u) => u.booking_id === booking_id);

    if (!booking || !user) {
      return res
        .status(404)
        .json({ success: false, message: "Booking or user not found" });
    }

    // Update booking status
    booking.status = "confirmed";
    booking.payment_id = razorpay_payment_id;
    booking.order_id = razorpay_order_id;

    // Generate tickets and send email
    await generateAndSendTickets(booking, user);

    res.json({ success: true, message: "Payment confirmed and tickets sent" });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to confirm payment" });
  }
});

// Function to generate individual tickets and send email
async function generateAndSendTickets(booking, user) {
  try {
    const attachments = [];
    const { tickets } = booking;
    let ticketNumber = 1;

    // Generate individual tickets based on ticket counts
    const ticketTypes = [
      { type: "couple", count: tickets.couple || 0, price: 400 },
      { type: "girls", count: tickets.girls || 0, price: 200 },
      { type: "boys", count: tickets.boys || 0, price: 200 },
    ];

    for (const ticketType of ticketTypes) {
      for (let i = 0; i < ticketType.count; i++) {
        // Generate QR code with unique ticket data
        const qrData = `TICKET-${
          booking.id
        }-${ticketType.type.toUpperCase()}-${ticketNumber}`;
        const qrCode = await generateQRCode(qrData);

        // Prepare ticket data
        const ticketData = {
          name: user.name,
          date: booking.booking_date,
          pass_type:
            ticketType.type.charAt(0).toUpperCase() + ticketType.type.slice(1),
          price: ticketType.price,
          ticketNumber: `NF${booking.id}-${ticketNumber}`,
          qrCode,
        };

        // Generate PDF
        const pdfPath = await generateTicketPDF(ticketData);

        attachments.push({
          filename: `Ticket_${ticketNumber}_${ticketType.type}.pdf`,
          path: pdfPath,
        });

        ticketNumber++;
      }
    }

    // Send email with all tickets
    const subject =
      "🎉 Your Malang Ras Dandiya Night Tickets - Booking Confirmed!";
    await sendTicketEmail(user.email, subject, user.name, attachments);

    // Clean up PDF files after sending
    const fs = require("fs");
    attachments.forEach((attachment) => {
      if (fs.existsSync(attachment.path)) {
        fs.unlinkSync(attachment.path);
      }
    });

    console.log(
      `Successfully sent ${attachments.length} tickets to ${user.email}`
    );
  } catch (error) {
    console.error("Error generating and sending tickets:", error);
    throw error;
  }
}

module.exports = router;
