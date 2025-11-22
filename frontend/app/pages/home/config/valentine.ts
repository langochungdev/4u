import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const VALENTINE_SECTION = createSection({
  id: 'valentine',
  title: 'Valentine',
  description: 'Thiệp tình yêu lãng mạn cho ngày Valentine',
  demoId: 'FkzqcoAZs0kgrlCr1BHu'
});

export const VALENTINE_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
  'galaxy-love': { visible: true },
  'anniversary-love': { visible: true },
  'love-more-v1': { visible: true },
  'love-more-v2': { visible: true }
};


export const loadValentineSection = async () => {
  await loadSectionData(VALENTINE_SECTION, VALENTINE_TEMPLATES_CONFIG, VALENTINE_SECTION.demoId);
};
