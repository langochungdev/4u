import type { TemplateConfig } from '@/config/templates';
import demo from './demo.webp';

const config: TemplateConfig = {
    title: 'christmas-box - Hộp quà Giáng Sinh',
    description: 'Mẫu thiệp Giáng Sinh với hộp quà đáng yêu và không khí lễ hội ấm áp.',
    createdBy: 'khadev',
    maxImages: 3,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 1,
    contentPlaceholders: [
        'Nội dung chúc mừng Giáng Sinh...',
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
