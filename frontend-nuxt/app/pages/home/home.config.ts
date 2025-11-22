import { VALENTINE_SECTION, loadValentineSection } from './config/valentine';
import { NGAYNHAGIAO_SECTION, loadNgayNhaGiaoSection } from './config/20-11';
import { CHRISTMAS_SECTION, loadChristmasSection } from './config/christmas';

export const HOME_SECTIONS: Section[] = [
  CHRISTMAS_SECTION,
  NGAYNHAGIAO_SECTION,
  VALENTINE_SECTION,
];




export const loadAllSections = async () => {
  // Load sections in parallel with Promise.allSettled to prevent one failure blocking others
  const results = await Promise.allSettled([
    loadValentineSection(),
    loadNgayNhaGiaoSection(),
    loadChristmasSection()
  ]);
  
  // Log any failures for debugging
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`Failed to load section ${index}:`, result.reason);
    }
  });
};

export interface TemplateCard {
  id: string; 
  title: string;
  description: string;
  thumbnail: string; 
  thumbnailType: 'image' | 'video';
  demoId: string; 
  createdBy?: string;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  demoId?: string;
  cards: TemplateCard[];
}