import type { TemplateConfig } from '@/config/templates';
import demo from './demo.jpeg';

const config: TemplateConfig = {
    title: 'christmas',
    description: 'Merry Christmas',
    createdBy: 'Langochungdev',
    maxImages: 10,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 10,
    contentPlaceholders: [
        'gợi ý 1',
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
