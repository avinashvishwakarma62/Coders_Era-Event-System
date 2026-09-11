const QRCode = require("qrcode");

async function generateQRCode(data) {
  try {
    const qrCode = await QRCode.toDataURL(data);
    return qrCode;
  } catch (error) {
    console.error("QR generation error:", error.message);
    throw error;
  }
}

module.exports = generateQRCode;