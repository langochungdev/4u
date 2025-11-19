import type { TemplateConfig } from '@/config/templates';
import teachears from './demo.png';

const config: TemplateConfig = {
    title: 'teacher-v1 - Lời chúc thầy cô 20-11',
    description: 'Mẫu lời chúc thầy cô nhân ngày 20-11 ý nghĩa, trang trọng và đẹp mắt.',
    createdBy: 'tranminhkhadev',
    maxImages: 1,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 3,
    contentPlaceholders: [
        'Tên thầy cô',
        'Lời chúc',
        'Tên người gửi'
    ],




    thumbnail: teachears,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
