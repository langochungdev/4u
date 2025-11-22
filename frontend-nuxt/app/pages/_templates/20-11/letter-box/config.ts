import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'letter-box - Hộp Thư Kỷ Niệm',
    description: 'Hộp thư kỷ niệm để lưu trữ lời chúc và hình ảnh dành tặng thầy cô.',
    createdBy: 'tranminhkhadev',
    maxImages: 1,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 1,
    contentPlaceholders: [
        'Nội dung thiệp',
    ],


    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
