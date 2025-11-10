import type { TemplateConfig } from "@/config/templates";
import demo from './demo.png';

const config: TemplateConfig = {
  title: 'Love More v2',
  description: 'Tình yêu mãnh liệt hơn - Phiên bản 2',
  createdBy: 'Tan',
  
  maxImages: 5,
  maxVideos: 0,
  maxAudios: 1,
  maxContent: 6,
contentPlaceholders: [
        'Nội dung 1',
        'Nội dung 2',
        'Nội dung 3',
        'Nội dung 4',
        'Nội dung 5',
        'Nội dung 6',
    ],

  
  demoId: 'demo', 
  thumbnailType: 'image',
  thumbnail: demo,
  templateName: new URL('.', import.meta.url).pathname.split('/').pop() || "",
};

export default config;
