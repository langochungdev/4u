import { VALENTINE_SECTION, loadValentineSection } from './config/valentine';
import { NGAYNHAGIAO_SECTION, loadNgayNhaGiaoSection } from './config/20-11';
import { CHRISTMAS_SECTION, loadChristmasSection } from './config/christmas';

export const HOME_SECTIONS: Section[] = [
    CHRISTMAS_SECTION,
    NGAYNHAGIAO_SECTION,
    VALENTINE_SECTION,
];




export const loadAllSections = async () => {
  await loadValentineSection();
  await loadNgayNhaGiaoSection();
  await loadChristmasSection();
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