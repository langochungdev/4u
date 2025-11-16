export const DISABLE_DEVTOOLS = (() => {
  const v = import.meta.env.VITE_DISABLE_DEVTOOLS;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
})();

export const ECARD_LIMIT = (() => {
  const v = Number(import.meta.env.VITE_ECARD_LIMIT);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 15;
})();

export const OTP_BYPASS = (() => {
  const v = import.meta.env.VITE_OTP_BYPASS;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return false;
})();

export const MEDIA_LIMITS = {
  maxImages: (() => {
    const v = Number(import.meta.env.VITE_MAX_IMAGES);
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 5;
  })(),
  maxVideos: (() => {
    const v = Number(import.meta.env.VITE_MAX_VIDEOS);
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 1;
  })(),
  maxAudios: (() => {
    const v = Number(import.meta.env.VITE_MAX_AUDIOS);
    return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 1;
  })(),
};

export default {
  DISABLE_DEVTOOLS,
  ECARD_LIMIT,
  OTP_BYPASS,
  MEDIA_LIMITS,
};
