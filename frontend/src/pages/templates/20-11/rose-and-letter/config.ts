import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.png";

const config: TemplateConfig = {
  title: "Thiệp gửi lời chúc",
  description: "Template thiệp chúc mừng cho 20/11.",
  createdBy: "TAN",

  maxImages: 1,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 2,

  contentPlaceholders: [
    "Tiêu đề trên thiệp (ví dụ: 'Tặng Thầy/Cô')",
    "Nội dung lời chúc chính",
  ],

  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
