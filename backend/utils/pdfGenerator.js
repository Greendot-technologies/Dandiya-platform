const PDFDocument = require("pdfkit");
const fontkit = require("fontkit");
const fs = require("fs");
const path = require("path");

const generateTicketPDF = (ticketData) => {
  return new Promise((resolve, reject) => {
    const { name, date, pass_type, qrCode, price, ticketNumber } = ticketData;

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const fileName = `ticket-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "..", "tickets", fileName);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add background image (bg.png) stretched to full page
    const bgPath = path.join(__dirname, "..", "assets", "bg.png");
    if (fs.existsSync(bgPath)) {
      doc.image(bgPath, 0, 0, {
        width: doc.page.width,
        height: doc.page.height,
      });
    }

    // Optional: border (if you want to keep it, uncomment below)
    // doc
    //   .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    //   .lineWidth(3)
    //   .strokeColor("#ff9933")
    //   .stroke();

    // Header: Logo centered, shifted downward
    const logoPath = path.join(__dirname, "..", "assets", "malang-logo.png");
    const logoY = 100; // Shift logo and all content down by increasing Y
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 75, logoY, {
        width: 150,
        height: 150,
      });
      doc.y = logoY + 150 + 20; // Set doc.y below logo for next content
    } else {
      doc.y = logoY;
      doc
        .fontSize(32)
        .fillColor("#ff4500")
        .text("Malang Ras Dandiya", { align: "center" });
      doc.moveDown(3);
    }

    // Ticket/Event details
    // doc
    //   .fontSize(18)
    //   .fillColor("#333")
    //   .text(`${pass_type} Ticket`, { align: "center" });
    // doc.moveDown(3); // ✅ Increased spacing before details
    doc
      .fontSize(14)
      .fillColor("#555")
      .text(`Name: ${name}`, { align: "center" });
    doc.text(`Date: ${date}`, { align: "center" });
    if (price) doc.text(`Price: ${price} Rs `, { align: "center" });
    if (pass_type)
      doc.text(`Ticket Type: ${pass_type} Ticket`, { align: "center" });
    if (ticketNumber)
      doc.text(`Ticket No: ${ticketNumber}`, { align: "center" });
    doc.moveDown(2); // ✅ More gap before QR section

    // QR Code section
    doc
      .fontSize(14)
      .fillColor("#ff4500")
      .text("Scan this QR Code at Entry", { align: "center" });
    doc.moveDown(1);

    const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
    const qrImagePath = path.join(
      __dirname,
      "..",
      "tickets",
      `qr-${Date.now()}.png`
    );
    fs.writeFileSync(qrImagePath, base64Data, "base64");

    // Draw double rounded border around QR code (like provided image)
    const qrSize = 150;
    const borderSize = 16;
    const borderRadius = 28;
    const qrX = doc.page.width / 2 - (qrSize + borderSize) / 2;
    const qrY = doc.y;

    // Outer orange rounded rectangle
    doc.save();
    doc
      .roundedRect(
        qrX,
        qrY,
        qrSize + borderSize,
        qrSize + borderSize,
        borderRadius
      )
      .lineWidth(6)
      .strokeColor("#ff9900")
      .stroke();

    // Inner white rounded rectangle
    const innerOffset = 6;
    doc
      .roundedRect(
        qrX + innerOffset,
        qrY + innerOffset,
        qrSize + borderSize - 2 * innerOffset,
        qrSize + borderSize - 2 * innerOffset,
        borderRadius - 8
      )
      .lineWidth(4)
      .strokeColor("#fff")
      .stroke();

    // Draw QR code image centered inside the border
    doc.image(qrImagePath, qrX + borderSize / 2, qrY + borderSize / 2, {
      width: qrSize,
      height: qrSize,
    });
    doc.restore();
    doc.moveDown(12); // More gap after QR and border

    // Footer
    doc
      .fontSize(12)
      .fillColor("#ff4500")
      .text("Powered by yourticketcompany", { align: "center" });
    doc.moveDown(1); // Small gap before location
    // Add location icon and text on the same line, centered
    const locationIconPath = path.join(
      __dirname,
      "..",
      "assets",
      "location1.jpg"
    );
    const locationText = "Location: Regal Lawns & Hall";
    const iconSize = 20;
    let locationY = doc.y;
    if (fs.existsSync(locationIconPath)) {
      // Calculate total width for centering
      const textWidth = doc.widthOfString(locationText, { fontSize: 14 });
      const totalWidth = iconSize + 6 + textWidth;
      const startX = (doc.page.width - totalWidth) / 2;
      doc.image(locationIconPath, startX, locationY - 2, {
        width: iconSize,
        height: iconSize,
      });
      // Add clickable link annotation over the icon
      const mapUrl = "https://maps.app.goo.gl/LTA82LZKALe1v5h57";
      doc.link(startX, locationY - 2, iconSize, iconSize, mapUrl);
      doc
        .fontSize(12)
        .fillColor("#333")
        .text(locationText, startX + iconSize + 6, locationY, {
          continued: false,
        });
      doc.moveDown(1);
    } else {
      doc
        .fontSize(12)
        .fillColor("#333")
        .text(locationText, { align: "center" });
    }

    doc.end();

    stream.on("finish", () => {
      if (fs.existsSync(qrImagePath)) {
        fs.unlinkSync(qrImagePath);
      }
      resolve(filePath);
    });

    stream.on("error", (err) => {
      if (fs.existsSync(qrImagePath)) {
        fs.unlinkSync(qrImagePath);
      }
      reject(err);
    });
  });
};

module.exports = generateTicketPDF;
