export const useCloudinaryConfig = () => {
  const config = useRuntimeConfig().public
  
  return {
    CLOUD_NAME: config.cloudinaryCloudName,
    UPLOAD_PRESET: config.cloudinaryUploadPreset,
  }
}

export const cloudinaryConfig = {
  CLOUD_NAME: '',
  UPLOAD_PRESET: '',
}
