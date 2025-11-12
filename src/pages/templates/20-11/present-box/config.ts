import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.png";

const config: TemplateConfig = {
  title: "Hộp quà 3D & Thiệp",
  description:
    "Template hộp quà 3D tự xoay, khi click sẽ mở ra thiệp chúc mừng. Hiệu ứng hoa rơi và pháo hoa cho 20/11.",
  createdBy: "TAN",

  maxImages: 3,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 3,

  contentPlaceholders: [
    "Nội dung lời chúc chính",
    "Tên sự kiện (ví dụ: 'Chúc 20/11')",
    "Tiêu đề trên thiệp (ví dụ: 'Tặng Thầy/Cô')",
  ],

  demoId: "3d-present-box",
  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
