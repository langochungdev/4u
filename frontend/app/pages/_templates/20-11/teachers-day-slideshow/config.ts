import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.webp";

const config: TemplateConfig = {
  title: "teachers-day-slideshow - Thiệp chúc mừng 20/11",
  description: "Template thiệp chúc mừng 20/11 với hiệu ứng slideshow.",
  createdBy: "TAN",

  maxImages: 4,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 3,

  contentPlaceholders: [
    "Tiêu đề trên thiệp (ví dụ: 'Chúc mừng 20/11')",
    "Nội dung lời chúc 1 (hiển thị đầu tiên)",
    "Nội dung lời chúc 2 (dùng để xoay vòng)",
  ],

  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
