import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Birthday-2011',
    description: 'Thư mừng sinh nhật phong cách năm 20-11',
    createdBy: 'tranminhkhadev',
    maxImages: 0,
    maxVideos: 0,
    maxAudios: 0,
    maxContent: 3,
    contentPlaceholders: [
        'Tên thầy / cô',
        'Lời chúc gửi thầy cô',
        'Tên người gửi / chữ ký',
    ],



    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
