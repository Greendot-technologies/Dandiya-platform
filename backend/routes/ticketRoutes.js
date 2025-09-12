const express = require("express");
const router = express.Router();

const { generateAndEmailTicket } = require("../controllers/ticketController");

// router.post("/generate", generateTicketQR);

// POST /api/tickets/email
router.post("/email", generateAndEmailTicket);

module.exports = router;
