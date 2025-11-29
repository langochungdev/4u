import type { TemplateConfig } from '@/config/templates';
import demo from './demo.webp';

const config: TemplateConfig = {
    title: 'christmas-blingbling - Cây thông noel',
    description: 'Gửi những ảnh giáng sinh đáng yêu kèm lời chúc ấm áp đến người thân và bạn bè của bạn trong dịp lễ hội này!',
    createdBy: 'DuongDinhTrac',
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 2,
    contentPlaceholders: [
       'Title lá thư',
       'Nội dung lời chúc'
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
