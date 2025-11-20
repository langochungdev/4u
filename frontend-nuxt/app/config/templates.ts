// Template configuration interface
// Mỗi template phải implement interface này trong file config riêng

/**
 * Interface chung cho tất cả template configs
 * Mỗi template PHẢI tuân thủ interface này
 */
export interface TemplateConfig {
    // Thông tin hiển thị UI
    title: string;
    description: string;
    thumbnail: string;
    thumbnailType: 'image' | 'video';
    demoId?: string;
    createdBy?: string;
    
    // Cấu hình upload media
    maxImages: number;
    maxVideos: number;
    maxAudios: number;
    maxContent: number;
    contentPlaceholders?: string[];
    
    // Metadata
    templateName: string;
}

/**
 * Dynamic import template config từ folder của template
 * @param templateName - Tên template (ví dụ: galaxy-love) hoặc đường dẫ đầy đủ (valentine/galaxy-love)
 * @returns Promise resolve với TemplateConfig hoặc null nếu không tìm thấy
 */
export const getTemplateConfig = async (templateName: string): Promise<TemplateConfig | null> => {
    try {
        // Preload tất cả config files
        const configs = import.meta.glob('@/pages/_templates/**/config.ts', { eager: true }) as Record<string, any>;

        // Nếu có dấu /, coi như đường dẫn đầy đủ
        if (templateName.includes('/')) {
            // Thử nhiều format path khác nhau
            const possiblePaths = [
                `/src/pages/_templates/${templateName}/config.ts`,
                `/@/pages/_templates/${templateName}/config.ts`,
                `/pages/_templates/${templateName}/config.ts`,
            ];
            
            for (const testPath of possiblePaths) {
                const configModule = configs[testPath];
                if (configModule) {
                    return configModule?.default || configModule?.config || null;
                }
            }
            
            // Nếu không tìm thấy bằng exact path, tìm bằng pattern matching
            for (const path in configs) {
                if (path.includes(`/${templateName}/config.ts`)) {
                    const configModule = configs[path];
                    return configModule?.default || configModule?.config || null;
                }
            }
        }

        // Nếu chỉ có tên template, tìm trong tất cả configs
        for (const path in configs) {
            if (path.includes(`/${templateName}/config.ts`)) {
                const configModule = configs[path];
                return configModule?.default || configModule?.config || null;
            }
        }

        return null;
    } catch (error) {
    // template config not found
        return null;
    }
};

/**
 * Kiểm tra template có tồn tại không bằng cách thử load config
 * @param templateName - Tên template
 * @returns Promise resolve với boolean
 */
export const isValidTemplate = async (templateName: string): Promise<boolean> => {
    const config = await getTemplateConfig(templateName);
    return config !== null;
};

/**
 * Lấy thông tin createdBy từ template config
 * @param templateName - Tên template
 * @returns Promise resolve với string hoặc null nếu không tìm thấy
 */
export const getTemplateCreatedBy = async (templateName: string): Promise<string | null> => {
    const config = await getTemplateConfig(templateName);
    return config?.createdBy || null;
};
