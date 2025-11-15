import type { TemplateConfig } from '@/config/templates';
import { demoid } from '@/pages/input/context.service';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'demo update',
    description: 'mô tả template',
    createdBy: 'Langochungdev',
    maxImages: 0,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 1,
    contentPlaceholders: [
        'gợi ý 1',
    ],




    demoId: demoid,
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
