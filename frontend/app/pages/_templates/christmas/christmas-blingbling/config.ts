import type { TemplateConfig } from '@/config/templates';
import demo from './demo.webp';

const config: TemplateConfig = {
    title: 'Giáng Sinh Lung Linh - christmas-blingbling',    
    description: 'Đắm mình vào không gian đêm đông huyền ảo với cây thông 3D lấp lánh. Gửi gắm những lời chúc ấm áp và lưu giữ kỷ niệm qua tấm thiệp Scrapbook phong cách Polaroid cổ điển.',    createdBy: 'DuongDinhTrac',
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 2,
    contentPlaceholders: [
       'Title lá thư',
       'Nội dung lời chúc'
    ],

    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
