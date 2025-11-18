import type { TemplateConfig } from '@/config/templates';
import demo from './demo.png';

const config: TemplateConfig = {
    title: 'Sách tri lưu giữ kỷ niệm 20-11 ',
    description: 'Hãy để lại những lời chúc ý nghĩa và hình ảnh đẹp nhất dành tặng thầy cô nhân ngày Nhà Giáo Việt Nam 20-11 với mẫu sổ tay tri ân này!',
    createdBy: 'DuongDinhTrac',
    maxImages: 5,
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
