import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const NGAYNHAGIAO_SECTION = createSection({
  id: '20-11',
  title: '20 tháng 11',
  description: 'Thiệp tri ân thầy cô cho ngày Nhà giáo Việt Nam',
  demoId: 'FkzqcoAZs0kgrlCr1BHu'
});

export const NGAYNHAGIAO_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
  'letter-for-2011': { visible: true },
  'password-for-2011': { visible: true },
  'teacher-v1': { visible: true },
  'teachers-day-slideshow': { visible: true },
  'letter-box': { visible: true },
  'notebook-for-2011': { visible: true },
  'rose-and-letter': { visible: true },
  'present-box': { visible: true },
  'demo': { visible: true }
};


export const loadNgayNhaGiaoSection = async () => {
  await loadSectionData(NGAYNHAGIAO_SECTION, NGAYNHAGIAO_TEMPLATES_CONFIG, NGAYNHAGIAO_SECTION.demoId);
};
