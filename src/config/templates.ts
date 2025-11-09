// Template configuration interface
// Mỗi template phải implement interface này trong file config riêng

/**
 * Interface chung cho tất cả template configs
 * Mỗi template PHẢI tuân thủ interface này
 */
export interface TemplateConfig {
    maxImages: number;
    maxVideos: number;
    maxAudios: number;
    maxContent: number;
    templateName: string;
}

/**
 * Dynamic import template config từ folder của template
 * @param templateName - Tên template (phải trùng với tên folder)
 * @returns Promise resolve với TemplateConfig hoặc null nếu không tìm thấy
 */
export const getTemplateConfig = async (templateName: string): Promise<TemplateConfig | null> => {
    try {
        // Dynamic import từ folder template
        const configModule = await import(`@/pages/templates/${templateName}/${templateName}.config.ts`);
        return configModule.default || configModule.config || null;
    } catch (error) {
        console.error(`Template "${templateName}" config not found:`, error);
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
