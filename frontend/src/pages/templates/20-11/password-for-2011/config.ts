import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Mật Mã Tri Ân 20/11',
    description: 'Một món quà bất ngờ! Yêu cầu người nhận nhập mật mã "2011" để mở khóa lá thư tri ân và album ảnh lộng lẫy.',
    createdBy: 'DuongDinhTrac',
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 1,
    contentPlaceholders: [
        'Nhập Nội Dung Thư'
    ],

    demoId: 'demo',
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
