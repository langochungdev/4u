import type { TemplateConfig } from '@/config/templates';
import demo from './demo.webp';

const config: TemplateConfig = {
    title: 'Pine Tree',
    description: 'Mẫu cây thông noel đơn giản, dễ thương.',
    createdBy: 'khadev',
    maxImages: 1,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 1,
    contentPlaceholders: [
        'lời chúc giáng sinh...',
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
