import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Love More v1',
    description: 'Tình yêu mãnh liệt hơn',
    createdBy: 'Kha',
    
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 1,
    contentPlaceholders: [
        'Nội dung 1',
    ],


    demoId: 'demo',
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
