import QRCode from "qrcode";

/**
 * Generates a QR Code as an SVG string (ideal for responsive rendering and crisp print sizes)
 */
export async function generateQRCodeSVG(text: string): Promise<string> {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      margin: 2,
      width: 256,
      color: {
        dark: "#1e1b4b", // Dark Indigo to match premium design
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code SVG Generation error:", err);
    return "";
  }
}

/**
 * Generates a QR Code as a base64 Data URL (ideal for <img> tags and instant download)
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 2,
      width: 256,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code Data URL Generation error:", err);
    return "";
  }
}
