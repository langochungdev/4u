import { VALENTINE_SECTION, loadValentineSection } from './config/valentine';
import { NGAYNHAGIAO_SECTION, loadNgayNhaGiaoSection } from './config/20-11';

export const HOME_SECTIONS: Section[] = [
  NGAYNHAGIAO_SECTION,
  VALENTINE_SECTION,
];




export const loadAllSections = async () => {
  await loadValentineSection();
  await loadNgayNhaGiaoSection();
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
  cards: TemplateCard[];
}