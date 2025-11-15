import type { TemplateConfig } from '@/config/templates';
import { demoid } from '@/pages/input/context.service';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Anniversary Love',
    description: 'Kỷ niệm tình yêu ngọt ngào - pass demo "Nội dung"',
    createdBy: 'Trac',

    maxImages: 5,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 3,
    contentPlaceholders: [
        'Nội dung 1',
        'Nội dung 2',
        'Nội dung 3',
    ],


    thumbnail: demo,
    demoId: demoid,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
