import type { TemplateConfig } from "@/config/templates";
import demo from './demo.png';

const config: TemplateConfig = {
  title: "Love More v2",
  description: "Tình yêu mãnh liệt hơn - Phiên bản 2",
  createdBy: "Tan",

  maxImages: 5,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 6,

  contentPlaceholders: [
    "Lời chào mở đầu (VD: Chào cậu! 💐)",
    "Câu dẫn dắt (VD: Này cậu ơi, đúng rồi là cậu đó!)",
    "Gợi ý nhìn góc trái (VD: Thử nhìn lên góc trái điện thoại xem 🫣)",
    "Gợi ý nhìn góc phải (VD: À nhầm, là bên phải chứ 🤣)",
    "Tiêu đề lời nhắn cuối (VD: Tại sao tớ lại yêu cậu nhiều thế? 🌹)",
    "Nội dung lời nhắn (VD: Bởi vì cậu đáng yêu hơn những gì tớ nói...)",
  ],

  demoId: demoid,
  thumbnailType: "image",
  thumbnail: demo,
  templateName: new URL(".", import.meta.url).pathname.split("/").pop() || "",
};

export default config;
