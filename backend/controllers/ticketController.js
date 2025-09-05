const generateQRCode  = require('../utils/qrGenerator');
const generateTicketPDF = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/emailService');
const fs = require('fs');

exports.generateAndEmailTicket = async (req, res) => {
  const { name, event, date, email } = req.body;
  if (!name || !event || !date || !seat || !email) {
    return res.status(400).json({ error: 'All fields are required, including email' });
  }

  const ticketData = {
    name,
    event,
    date,
    issuedAt: new Date().toISOString(),
  };

  try {
    // 1. Generate QR code
    const qrCode = await generateQRCode(JSON.stringify(ticketData));

    // 2. Generate PDF ticket
    const pdfPath = await generateTicketPDF({ ...ticketData, qrCode });

    // 3. Send email with PDF attached
    await sendTicketEmail(
      email,
      `Your Ticket for ${event}`,
      `Hi ${name},\n\nAttached is your ticket for ${event} on ${date}.\n\nEnjoy!`,
      pdfPath
    );

    // 4. Optionally clean up the PDF after sending
    fs.unlinkSync(pdfPath);

    res.status(200).json({ success: true, message: 'Ticket emailed successfully.' });
  } catch (err) {
    console.error('Error in ticket/email flow:', err);
    res.status(500).json({ error: 'Failed to generate or send ticket.' });
  }
};
