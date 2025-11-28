import type { TemplateConfig } from "@/config/templates";
import demo from "./demo.webp";

const config: TemplateConfig = {
  title: "Giáng sinh lung linh",
  description:
    "Thiệp Giáng sinh tương tác: Gửi tặng người thương kèm ảnh kỷ niệm.",
  createdBy: "TAN",

  // NÂNG CẤP: Cho phép upload 1 ảnh (Ảnh kỷ niệm/Avatar)
  maxImages: 1,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 1,
  contentPlaceholders: ["Nhập lời chúc Giáng sinh của bạn vào đây..."],

  thumbnail: demo,
  thumbnailType: "image",
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
