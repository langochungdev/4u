import QRCode from "qrcode";

/**
 * Sinh mã QR dựa trên id (lấy origin hiện tại + mã template cố định)
 * @param id: ví dụ "12345678"
 * @returns { link, qrDataUrl }
 */
export async function createQRFromId(id: string): Promise<{ link: string; qrDataUrl: string }> {
  if (!id) throw new Error("id required");

  const origin = window.location.origin;

  const TEMPLATE_CODE = "tp1";

  const link = `${origin}/${TEMPLATE_CODE}/${id}`;

  const qrDataUrl = await QRCode.toDataURL(link, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return { link, qrDataUrl };
}
