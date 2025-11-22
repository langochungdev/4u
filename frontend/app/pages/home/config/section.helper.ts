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
  
  const configs = import.meta.glob('@/pages/_templates/**/config.ts', { eager: true });
  
  for (const path in configs) {
    if (!path.includes(`/_templates/${sectionId}/`)) continue;
    
    const config = (configs[path] as { default: TemplateConfig }).default;
    if (config) {
      const templatePath = path.replace('/@/pages/_templates/', '').replace('/config.ts', '');
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
    // Lấy thứ tự khai báo từ keys của templatesConfig
    const configKeys = Object.keys(templatesConfig);
    const declarationOrderMap = new Map<string, number>();
    configKeys.forEach((key, index) => {
      declarationOrderMap.set(key, index);
    });

    return cards
      .filter(card => {
        const templateConfig = templatesConfig[card.id];
        return templateConfig ? templateConfig.visible : true;
      })
      .sort((a, b) => {
        // Ưu tiên sử dụng order nếu có khai báo (backward compatible)
        const orderA = templatesConfig[a.id]?.order;
        const orderB = templatesConfig[b.id]?.order;
        
        // Nếu cả 2 đều có order, so sánh theo order
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }
        
        // Nếu chỉ a có order, a lên trước
        if (orderA !== undefined) return -1;
        // Nếu chỉ b có order, b lên trước
        if (orderB !== undefined) return 1;
        
        // Nếu cả 2 đều không có order, dùng thứ tự khai báo trong config object
        const declOrderA = declarationOrderMap.get(a.id) ?? 999;
        const declOrderB = declarationOrderMap.get(b.id) ?? 999;
        
        if (declOrderA !== declOrderB) {
          return declOrderA - declOrderB;
        }
        
        // Tie-breaker cuối cùng: sắp xếp theo id để đảm bảo tính ổn định
        return a.id.localeCompare(b.id);
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
