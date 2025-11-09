import { VALENTINE_SECTION } from './valentine';
import { BIRTHDAY_SECTION } from './birthday';

export const HOME_SECTIONS: Section[] = [
  VALENTINE_SECTION,
  BIRTHDAY_SECTION,
];



export interface TemplateCard {
  id: string;
  templateName: string;
  title: string;
  description: string;
  thumbnail: string; 
  thumbnailType: 'image' | 'video';
  demoLink: string; 
  createLink: string; 
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  cards: TemplateCard[];
}