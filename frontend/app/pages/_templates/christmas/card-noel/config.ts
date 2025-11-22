import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.webp";

const config: TemplateConfig = {
  title: "card-noel - giáng sinh an lành",
  description: "Thiệp giáng sinh với hiệu ứng mở bao thư 3D",
  createdBy: "TAN",
  maxImages: 1,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 3,

  contentPlaceholders: [
    "Tiêu đề (VD: Merry Christmas)",
    "Nhập lời chúc của bạn ở đây...",
    "Tên người gửi (VD: ♥ From ... ♥)",
  ],

  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
