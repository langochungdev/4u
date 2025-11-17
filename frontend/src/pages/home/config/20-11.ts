import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const NGAYNHAGIAO_SECTION = createSection({
  id: '20-11',
  title: '20 tháng 11',
  description: 'Thiệp tri ân thầy cô cho ngày Nhà giáo Việt Nam',
  demoId: 'JunoH3uUS2RgQJUmTdU1'
});

export const NGAYNHAGIAO_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
//   'demo': { visible: true, order: 1 , demoId: 'custom_demo_id_20_11' }
  'demo': { visible: false}
};


export const loadNgayNhaGiaoSection = async () => {
  await loadSectionData(NGAYNHAGIAO_SECTION, NGAYNHAGIAO_TEMPLATES_CONFIG, NGAYNHAGIAO_SECTION.demoId);
};
