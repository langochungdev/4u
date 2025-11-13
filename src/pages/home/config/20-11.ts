import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const NGAYNHAGIAO_SECTION = createSection({
  id: '20-11',
  title: '20 tháng 11',
  description: 'Thiệp tri ân thầy cô cho ngày Nhà giáo Việt Nam'
});

export const NGAYNHAGIAO_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
//   'galaxy-love': { visible: true, order: 1 },
};


export const loadNgayNhaGiaoSection = async () => {
  await loadSectionData(NGAYNHAGIAO_SECTION, NGAYNHAGIAO_TEMPLATES_CONFIG);
};
