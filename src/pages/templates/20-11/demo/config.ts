import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'demo update',
    description: 'mô tả template',
    createdBy: 'Langochungdev',
    maxImages: 0,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 2,
    contentPlaceholders: [
        'gợi ý 1',
        'gợi ý 2',
    ],




    demoId: 'demo',
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
