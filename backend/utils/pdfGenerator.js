const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateTicketPDF = (ticketData) => {
  return new Promise((resolve, reject) => {
    const { name, date, pass_type, qrCode } = ticketData;

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const fileName = `ticket-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "..", "tickets", fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // === Gradient Background ===
    doc
      .linearGradient(0, 0, doc.page.width, doc.page.height)
      .stop(0, "#ff9933") // orange
      .stop(0.5, "#ff4da6") // pink
      .stop(1, "#6600ff") // purple
      .rect(0, 0, doc.page.width, doc.page.height)
      .fill();

    // === Ticket Outer Border ===
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(4)
      .strokeColor("#fff")
      .stroke();

    // === Title Section ===
    doc
      .font("Helvetica-Bold")
      .fontSize(30)
      .fillColor("#ffffff")
      .text("🎉 Malang Ras Dandiya Night 🎉", {
        align: "center",
      });

    doc.moveDown(2);

    // === Left Side Details ===
    const leftX = 80;
    const startY = 200;

    doc
      .fontSize(18)
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .text("Ticket Details", leftX, startY);

    doc.moveDown(1);

    doc.font("Helvetica").fontSize(16).fillColor("#fff");
    doc.text(`🎫 Name: ${name}`, leftX, startY + 40);
    doc.text(`📅 Date: ${date}`, leftX, startY + 70);
    doc.text(`🎟️ Pass Type: ${pass_type}`, leftX, startY + 100);

    // === QR Code on Right Side ===
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
    const qrImagePath = path.join(
      __dirname,
      "..",
      "tickets",
      `qr-${Date.now()}.png`
    );
    fs.writeFileSync(qrImagePath, base64Data, "base64");

    doc.image(qrImagePath, doc.page.width - 250, startY, {
      fit: [150, 150],
      align: "right",
      valign: "center",
    });

    // === Footer Message ===
    doc
      .fontSize(14)
      .fillColor("#fff")
      .text("📍 Venue: Malang Grounds, City Center", 80, doc.page.height - 150);

    doc
      .fontSize(12)
      .fillColor("#eee")
      .text(
        "✨ Please carry a valid ID along with this ticket",
        80,
        doc.page.height - 120
      );

    doc
      .fontSize(12)
      .fillColor("#eee")
      .text(
        "🎶 Let's celebrate Navratri with dance & music!",
        80,
        doc.page.height - 100
      );

    doc.end();

    stream.on("finish", () => {
      fs.unlinkSync(qrImagePath); // Cleanup QR temp file
      resolve(filePath);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = generateTicketPDF;
