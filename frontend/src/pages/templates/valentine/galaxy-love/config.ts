import type { TemplateConfig } from '@/config/templates';
import { demoid } from '@/pages/input/context.service';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Galaxy Love',
    description: 'Tình yêu như vũ trụ bao la',
    createdBy: 'Langochungdev',
    
    maxImages: 4,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 4,
    contentPlaceholders: [
        'Nội dung 1',
        'Nội dung 2',
        'Nội dung 3',
        'Nội dung 4'
    ],


    demoId: demoid,
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
