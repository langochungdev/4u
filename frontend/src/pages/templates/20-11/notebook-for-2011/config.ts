import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Sách kỷ niệm ngày 20/11',
    description: 'Hãy để những hình ảnh thật ý nghĩa cùng những lời chúc chân thành gửi đến thầy cô giáo nhân ngày Nhà giáo Việt Nam 20/11 với mẫu sách kỷ niệm đẹp và trang trọng này.',
    createdBy: 'DuongDinhTrac',
    maxImages: 5,
    maxVideos: 0,
    maxAudios: 1,
    maxContent: 2,
    contentPlaceholders: [
        'Nhập title',
        'Nhập nội dung'
    ],

    demoId: 'demo',
    thumbnail: demo,
    thumbnailType: 'image',
    templateName: new URL('.', import.meta.url).pathname.split('/').pop() || ''
};

export default config;
