import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const CHRISTMAS_SECTION = createSection({
  id: 'christmas',
  title: 'Giáng Sinh',
  description: 'Thiệp chúc mừng Giáng Sinh',
  demoId: 'xDSljMHauh0aXZHzmTjl'
});

export const  CHRISTMAS_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
    'demo-christmas': { visible: false },
    'christmas-tree': { visible: true },
    'christmas-box': { visible: true },
    'card-noel': { visible: true },
};


export const loadChristmasSection = async () => {
  await loadSectionData(CHRISTMAS_SECTION, CHRISTMAS_TEMPLATES_CONFIG, CHRISTMAS_SECTION.demoId);
};
