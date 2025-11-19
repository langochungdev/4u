import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'password-for-2011 - Mật Mã Tri Ân 20/11',
    description: 'Nhập mật mã "2011"',
    createdBy: 'DuongDinhTrac',
    maxImages: 6,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 1,
    contentPlaceholders: [
        'Nhập Nội Dung Thư'
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
