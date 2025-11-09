import type { TemplateConfig } from "@/config/templates";

/**
 * Định nghĩa cấu hình cho template "Love You More"
 *
 * - maxImages: 5
 * - [0]: Ảnh nền (Background Overlay)
 * - [1]: Sticker 1 (Trang 'Start')
 * - [2]: Sticker 3a (Trang chính - mặc định)
 * - [3]: Sticker 3b (Trang chính - 'panah.gif')
 * - [4]: Sticker 3c (Trang chính - 'muah.gif')
 *
 * - maxAudios: 1
 * - [0]: Nhạc nền
 *
 * - maxContent: 6
 * - [0]: Lời chào (ví dụ: 'Hello You! 💐')
 * - [1]: Lời mở đầu (ví dụ: 'Hey you, yes you! 🫵...')
 * - [2]: Văn bản ẩn 1 (ví dụ: 'Eh, I mean right')
 * - [3]: Văn bản ẩn 2 (ví dụ: 'I love u more darling 🫶')
 * - [4] Văn bản chính 1 (ví dụ: 'Why do I prefer...')
 * - [5] Văn bản chính 2 (ví dụ: 'Because... I love you more...')
 */
const config: TemplateConfig = {
  maxImages: 5,
  maxVideos: 0, // Template này không dùng video
  maxAudios: 1,
  maxContent: 6,
  templateName: "love-more-V2", // Tên template mới
};

export default config;
