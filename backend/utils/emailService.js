const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends festive HTML email with PDF attachment
 */
async function sendTicketEmail(toEmail, subject, userName, attachments) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="text-align:center; color:#d63384;">🎉 Malang Ras Dandiya Night 🎉</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Thank you for booking your ticket(s) for our vibrant Malang Ras Dandiya Night! 💃🕺</p>
      <p>Please find your ticket(s) attached as a PDF. Present them (with QR code) at the venue entry.</p>
      <p><strong>📍 Venue:</strong> <em>Shivaji Ground, Aurangabad</em><br/>
         <strong>🕗 Time:</strong> 7 PM onwards</p>
      <br/>
      <p style="color:#888;">Wishing you a night full of music, colors, and joy!</p>
      <p style="margin-top: 30px;">Warm regards,<br/><strong>Team Malang Ras Dandiya</strong></p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"Malang Ras Dandiya" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
    attachments, // PDF files
  });

  return info;
}

module.exports = { sendTicketEmail };
