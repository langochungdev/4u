import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.webp";

const config: TemplateConfig = {
  title: "present-box - Hộp quà 3D & Thiệp",
  description:
    "Template hộp quà 3D tự xoay, khi click sẽ mở ra thiệp chúc mừng cho 20/11.",
  createdBy: "TAN",

  maxImages: 2,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 4,

  contentPlaceholders: [
    "Nội dung lời chúc chính",
    "Tên sự kiện (ví dụ: 'Chúc 20/11')",
    "Tiêu đề trên thiệp (ví dụ: 'Tặng Thầy/Cô')",
    "Caption dưới ảnh (ví dụ: 'GFF ❤️ 20-11-2023')",
  ],

  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
