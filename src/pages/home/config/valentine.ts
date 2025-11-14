import { createSection, loadSectionData, type TemplateVisibilityConfig } from './section.helper';

export const VALENTINE_SECTION = createSection({
  id: 'valentine',
  title: 'Valentine',
  description: 'Thiệp tình yêu lãng mạn cho ngày Valentine'
});

export const VALENTINE_TEMPLATES_CONFIG: Record<string, TemplateVisibilityConfig> = {
  'galaxy-love': { visible: true, order: 1 },
  'love-more-v1': { visible: true, order: 2 },
  'anniversary-love': { visible: true, order: 3 },
  'love-more-v2': { visible: true, order: 4 },
};


export const loadValentineSection = async () => {
  await loadSectionData(VALENTINE_SECTION, VALENTINE_TEMPLATES_CONFIG);
};
