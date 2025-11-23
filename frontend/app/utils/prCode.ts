import QRCode from "qrcode";

export async function createQRFromId(
  id: string,
  origin?: string
): Promise<{ link: string; qrDataUrl: string }> {
  if (!id) throw new Error("id required");

  const base = origin || (typeof window !== "undefined" ? window.location.origin : import.meta.env.VITE_BASE_URL || "");
  if (!base) throw new Error("createQRFromId: origin not available on server. Provide origin param.");

  const link = `${base}/tp1/${id}`;
  const qrDataUrl = await QRCode.toDataURL(link, {
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { link, qrDataUrl };
}
