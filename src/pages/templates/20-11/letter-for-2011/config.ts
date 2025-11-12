import type { TemplateConfig } from '@/config/templates';
import demo from './image.png';

const config: TemplateConfig = {
    title: 'Thư cho thầy cô giáo ngày 20/11',
    description: 'Hãy gửi nhừng lời chúc ý nghĩa đến thầy cô giáo nhân ngày Nhà giáo Việt Nam 20/11 với mẫu thư đẹp và trang trọng này.',
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
