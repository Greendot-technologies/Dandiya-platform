const QRCode = require("qrcode");

const generateQRCode = async (text) => {
  try {
    const qrImageURL = await QRCode.toDataURL(text); // base64 PNG image
    return qrImageURL;
  } catch (err) {
    throw new Error("Failed to generate QR Code");
  }
};

module.exports = generateQRCode;
