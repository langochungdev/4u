import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'letter-box - tiêu đề template',
    description: 'Mô tả template letter-box',
    createdBy: 'tranminhkhadev',
    maxImages: 1,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 1,
    contentPlaceholders: [
        'Nội dung thiệp',
    ],




    demoId: 'demo',
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
