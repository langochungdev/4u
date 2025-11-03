import QRCode from "qrcode";

export async function createQRFromId(id: string): Promise<{ link: string; qrDataUrl: string }> {
  if (!id) throw new Error("id required");

  const link = `${window.location.origin}/tp1/${id}`;
  const qrDataUrl = await QRCode.toDataURL(link, {
    width: 300,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { link, qrDataUrl };
}
