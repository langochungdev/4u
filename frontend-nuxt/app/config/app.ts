export const useAppConfig = () => {
  const config = useRuntimeConfig().public
  
  return {
    DISABLE_DEVTOOLS: config.disableDevtools,
    ECARD_LIMIT: config.ecardLimit,
    OTP_BYPASS: config.otpBypass,
    MEDIA_LIMITS: {
      maxImages: config.maxImages,
      maxVideos: config.maxVideos,
      maxAudios: config.maxAudios,
    }
  }
}

export const DISABLE_DEVTOOLS = false
export const ECARD_LIMIT = 15
export const OTP_BYPASS = true
export const MEDIA_LIMITS = {
  maxImages: 5,
  maxVideos: 1,
  maxAudios: 1,
}

export default {
  DISABLE_DEVTOOLS,
  ECARD_LIMIT,
  OTP_BYPASS,
  MEDIA_LIMITS,
}
