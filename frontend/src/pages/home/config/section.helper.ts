import type { Section, TemplateCard } from '../home.config';
import type { TemplateConfig } from '@/config/templates';

export interface TemplateVisibilityConfig {
  visible: boolean;
  order?: number;
  demoId?: string;
}

export interface SectionMetadata {
  id: string;
  title: string;
  description: string;
  demoId?: string;
  templatesConfig?: Record<string, TemplateVisibilityConfig>;
}

/**
 * Tạo section tự động từ metadata
 * @param metadata - Thông tin section (id, title, description, templatesConfig)
 * @returns Section object với cards tự động load
 */
export function createSection(metadata: SectionMetadata): Section {
  return {
    id: metadata.id,
    title: metadata.title,
    description: metadata.description,
    demoId: metadata.demoId,
    cards: []
  };
}

/**
 * Load cards tự động cho section từ thư mục templates
 * @param sectionId - ID của section (tên thư mục trong templates)
 * @param templatesConfig - Config để control visibility và order (optional)
 * @returns Promise với array các TemplateCard
 */
export async function loadSectionCards(
  sectionId: string,
  templatesConfig?: Record<string, TemplateVisibilityConfig>,
  sectionDemoId?: string
): Promise<TemplateCard[]> {
  const cards: TemplateCard[] = [];
  
  const configs = import.meta.glob('@/pages/templates/**/config.ts', { eager: true });
  
  for (const path in configs) {
    if (!path.includes(`/templates/${sectionId}/`)) continue;
    
    const config = (configs[path] as { default: TemplateConfig }).default;
    if (config) {
      const templatePath = path.replace('/@/pages/templates/', '').replace('/config.ts', '');
      const templateId = templatePath.split('/').pop() || templatePath;
      
      const templateSpecificDemoId = templatesConfig?.[templateId]?.demoId;
      const finalDemoId = templateSpecificDemoId || sectionDemoId || config.demoId || '';
      
      cards.push({
        id: templateId,
        title: config.title,
        description: config.description,
        thumbnail: config.thumbnail,
        thumbnailType: config.thumbnailType,
        demoId: finalDemoId,
        createdBy: config.createdBy
      });
    }
  }
  
  if (templatesConfig) {
    return cards
      .filter(card => {
        const templateConfig = templatesConfig[card.id];
        return templateConfig ? templateConfig.visible : true;
      })
      .sort((a, b) => {
        const orderA = templatesConfig[a.id]?.order ?? 999;
        const orderB = templatesConfig[b.id]?.order ?? 999;
        return orderA - orderB;
      });
  }
  
  return cards;
}

/**
 * Load cards cho một section và gán vào section.cards
 * @param section - Section object
 * @param templatesConfig - Config để control visibility và order (optional)
 */
export async function loadSectionData(
  section: Section,
  templatesConfig?: Record<string, TemplateVisibilityConfig>,
  sectionDemoId?: string
): Promise<void> {
  section.cards = await loadSectionCards(section.id, templatesConfig, sectionDemoId);
}
