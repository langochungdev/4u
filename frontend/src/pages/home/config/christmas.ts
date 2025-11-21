import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const CHRISTMAS_SECTION = createSection({
  id: 'christmas',
  title: 'Giáng Sinh',
  description: 'Thiệp chúc mừng Giáng Sinh',
  demoId: 'FkzqcoAZs0kgrlCr1BHu'
});

export const  CHRISTMAS_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
  'demo': { visible: false }
};


export const loadChristmasSection = async () => {
  await loadSectionData(CHRISTMAS_SECTION, CHRISTMAS_TEMPLATES_CONFIG, CHRISTMAS_SECTION.demoId);
};
