import type { Section, TemplateCard } from '../home.config';
import type { TemplateConfig } from '@/config/templates';

export interface TemplateVisibilityConfig {
  visible: boolean;
  order: number;
}

export interface SectionMetadata {
  id: string;
  title: string;
  description: string;
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
  templatesConfig?: Record<string, TemplateVisibilityConfig>
): Promise<TemplateCard[]> {
  const cards: TemplateCard[] = [];
  
  // Tự động load tất cả config trong thư mục section
  const configs = import.meta.glob('@/pages/templates/**/config.ts', { eager: true });
  
  for (const path in configs) {
    // Chỉ lấy templates thuộc section này
    if (!path.includes(`/templates/${sectionId}/`)) continue;
    
    const config = (configs[path] as { default: TemplateConfig }).default;
    if (config) {
      const templatePath = path.replace('/@/pages/templates/', '').replace('/config.ts', '');
      const templateId = templatePath.split('/').pop() || templatePath;
      
      cards.push({
        id: templateId,
        title: config.title,
        description: config.description,
        thumbnail: config.thumbnail,
        thumbnailType: config.thumbnailType,
        demoId: config.demoId,
        createdBy: config.createdBy
      });
    }
  }
  
  // Filter và sort theo config (nếu có)
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
  
  // Nếu không có config, return tất cả
  return cards;
}

/**
 * Load cards cho một section và gán vào section.cards
 * @param section - Section object
 * @param templatesConfig - Config để control visibility và order (optional)
 */
export async function loadSectionData(
  section: Section,
  templatesConfig?: Record<string, TemplateVisibilityConfig>
): Promise<void> {
  section.cards = await loadSectionCards(section.id, templatesConfig);
}
