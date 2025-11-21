export interface TemplateConfig {
    title: string;
    description: string;
    thumbnail: string;
    thumbnailType: 'image' | 'video';
    demoId?: string;
    createdBy?: string;
    
    maxImages: number;
    maxVideos: number;
    maxAudios: number;
    maxContent: number;
    contentPlaceholders?: string[];
    
    templateName: string;
}

export const getTemplateConfig = async (templateName: string): Promise<TemplateConfig | null> => {
    try {
        const configs = import.meta.glob('@/pages/_templates/**/config.ts', { eager: true }) as Record<string, any>;

        for (const path in configs) {
            if (path.includes(`/${templateName}/config.ts`)) {
                const configModule = configs[path];
                return configModule?.default || configModule?.config || null;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
};

export const isValidTemplate = async (templateName: string): Promise<boolean> => {
    const config = await getTemplateConfig(templateName);
    return config !== null;
};

export const getTemplateCreatedBy = async (templateName: string): Promise<string | null> => {
    const config = await getTemplateConfig(templateName);
    return config?.createdBy || null;
};
