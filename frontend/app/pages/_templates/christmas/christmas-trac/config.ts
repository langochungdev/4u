import type { TemplateConfig } from '@/config/templates';
import demo from './demo.webp';

const config: TemplateConfig = {
    title: 'christmas-trac - Sổ tay Giáng Sinh 2024',
    description: '',
    createdBy: 'DuongDinhTrac',
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 2,
    contentPlaceholders: [
       
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
