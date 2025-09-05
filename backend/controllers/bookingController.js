
const pool = require("../config/db");
const QRCode = require("../utils/qrGenerator");
const generateTicketPDF = require("../utils/pdfGenerator");
const { sendTicketEmail } = require("../utils/emailService");
const Razorpay = require("razorpay");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1️⃣ Booking Date + Ticket Count
// exports.createBooking = async (req, res) => {
//   const { booking_date, num_tickets } = req.body;
//   try {
//     const result = await pool.query(
//       `INSERT INTO bookings (booking_date, num_tickets) VALUES ($1, $2) RETURNING *`,
//       [booking_date, num_tickets]
//     );
//     res.status(201).json({ success: true, booking: result.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create booking" });
//   }
// };

// 1️⃣ Booking Date + Ticket Count + Pass Type

exports.createBooking = async (req, res) => {
  const { booking_date, num_tickets, pass_type } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO bookings (booking_date, num_tickets, pass_type) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [booking_date, num_tickets, pass_type]
    );

    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error("Error in createBooking:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// 2️⃣ Add User Details
exports.addUserDetails = async (req, res) => {
  const { booking_id, name, email, phone } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (booking_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *`,
      [booking_id, name, email, phone]
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user details" });
  }
};

// 3️⃣ Razorpay Order Create + Store in DB
exports.createPayment = async (req, res) => {
  const { booking_id, amount } = req.body;

  try {
    // Step 1: Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${booking_id}`,
    });

    // Step 2: Save initial payment entry
    await pool.query(
      `INSERT INTO payments (booking_id, razorpay_order_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [booking_id, order.id, amount, "INR", "created"]
    );

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Error in createPayment:", err);
    res.status(500).json({ error: "Failed to create and store payment order" });
  }
};

// 4️⃣ Confirm Payment + QR & Email
exports.confirmPayment = async (req, res) => {
  const {
    booking_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    // 1. Update payment record
    await pool.query(
      `UPDATE payments SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'success'
       WHERE razorpay_order_id = $3 AND booking_id = $4`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id, booking_id]
    );

    // 2. Update booking status
    await pool.query(`UPDATE bookings SET status='paid' WHERE id=$1`, [
      booking_id,
    ]);

    // 3. Get user & booking
    const userRes = await pool.query(
      `SELECT * FROM users WHERE booking_id=$1 LIMIT 1`,
      [booking_id]
    );
    const bookingRes = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [
      booking_id,
    ]);

    const user = userRes.rows[0];
    const booking = bookingRes.rows[0];

    // 4. Generate QR & PDF for each ticket and store in database
    const attachments = [];
    for (let i = 1; i <= booking.num_tickets; i++) {
      const qrData = {
        booking_id,
        user_id: user.id,
        name: user.name,
        date: booking.booking_date,
        ticket_no: i,
        total_tickets: booking.num_tickets,
        email: user.email,
        phone: user.phone,
        pass_type: booking.pass_type,
      };

      const qr = await QRCode(JSON.stringify(qrData));

      // Calculate expiry date (end of the selected day)
      const expiryDate = new Date(booking.booking_date);
      expiryDate.setHours(23, 59, 59, 999); // Set to the end of the day

      // Store QR code in database with expiry date
      await pool.query(
        `INSERT INTO qr_codes (booking_id, user_id, ticket_number, qr_data, qr_code_url, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [booking_id, user.id, i, JSON.stringify(qrData), qr, expiryDate]
      );

      const pdfPath = await generateTicketPDF({ ...qrData, qrCode: qr });

      attachments.push({
        filename: `Ticket_${i}.pdf`,
        path: pdfPath,
      });
    }

    // 5. Send email with all tickets
    await sendTicketEmail(
      user.email,
      "🎟 Your Navratri Dandiya Tickets",
      `Hi ${user.name},\n\nAttached are your ${booking.num_tickets} tickets for Navratri Dandiya on ${booking.booking_date}.`,
      attachments
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed and tickets emailed.",
    });
  } catch (err) {
    console.error("Error in confirmPayment:", err);
    res
      .status(500)
      .json({ error: "Failed to confirm payment and send ticket" });
  }
};

// 🆕 New endpoint to get QR code details by scanning
exports.getQRDetails = async (req, res) => {
  const { qr_data } = req.body;

  try {
    const parsedData = JSON.parse(qr_data);
    const { booking_id, ticket_no } = parsedData;

    const result = await pool.query(
      `SELECT qr.*, u.name, u.email, u.phone, b.booking_date, b.num_tickets, b.status
       FROM qr_codes qr
       JOIN users u ON qr.user_id = u.id
       JOIN bookings b ON qr.booking_id = b.id
       WHERE qr.booking_id = $1 AND qr.ticket_number = $2`,
      [booking_id, ticket_no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "QR code not found" });
    }

    const qrDetails = result.rows[0];

    // Check if the QR code is expired
    // const currentTime = new Date();
    // if (currentTime > new Date(qrDetails.expiry_date)) {
    //   return res.status(400).json({ error: "QR code has expired" });
    // }

    // Check if the QR code is expired (valid for whole event day)
    const currentTime = new Date();
    const eventDay = new Date(qrDetails.booking_date);
    eventDay.setHours(23, 59, 59, 999);
    if (currentTime > eventDay) {
      return res.status(400).json({ error: "QR code has expired" });
    }

    res.status(200).json({
      success: true,
      qr_details: qrDetails,
      ticket_info: {
        booking_id: qrDetails.booking_id,
        ticket_number: qrDetails.ticket_number,
        name: qrDetails.name,
        email: qrDetails.email,
        phone: qrDetails.phone,
        booking_date: qrDetails.booking_date,
        total_tickets: qrDetails.num_tickets,
        is_used: qrDetails.is_used,
        used_at: qrDetails.used_at,
      },
    });
  } catch (err) {
    console.error("Error getting QR details:", err);
    res.status(500).json({ error: "Failed to get QR code details" });
  }
};

// 🆕 New endpoint to mark ticket as used
exports.markTicketUsed = async (req, res) => {
  const { booking_id, ticket_number } = req.body;

  try {
    const result = await pool.query(
      `UPDATE qr_codes 
       SET is_used = true, used_at = CURRENT_TIMESTAMP 
       WHERE booking_id = $1 AND ticket_number = $2 
       RETURNING *`,
      [booking_id, ticket_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.status(200).json({
      success: true,
      message: "Ticket marked as used",
      ticket: result.rows[0],
    });
  } catch (err) {
    console.error("Error marking ticket as used:", err);
    res.status(500).json({ error: "Failed to mark ticket as used" });
  }
};

const markExpiredQRCodes = async () => {
  try {
    const result = await pool.query(
      `UPDATE qr_codes 
       SET is_used = true 
       WHERE expiry_date < CURRENT_TIMESTAMP AND is_used = false`
    );
    console.log(`${result.rowCount} QR codes marked as expired.`);
  } catch (err) {
    console.error("Error marking expired QR codes:", err);
  }
};

// Call this function periodically (e.g., using a cron job)
markExpiredQRCodes();
