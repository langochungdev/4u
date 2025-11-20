// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  runtimeConfig: {
    public: {
      backendUrl: process.env.VITE_BACKEND_URL || 'http://localhost:8080/api/',
      firestore: process.env.VITE_FIRESTORE || '',
      cloudinaryCloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || '',
      cloudinaryUploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
      disableDevtools: process.env.VITE_DISABLE_DEVTOOLS === 'true',
      ecardLimit: parseInt(process.env.VITE_ECARD_LIMIT || '15'),
      otpBypass: process.env.VITE_OTP_BYPASS === 'true',
      maxImages: parseInt(process.env.VITE_MAX_IMAGES || '5'),
      maxVideos: parseInt(process.env.VITE_MAX_VIDEOS || '1'),
      maxAudios: parseInt(process.env.VITE_MAX_AUDIOS || '1'),
      firebaseApiKey: process.env.VITE_FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      firebaseDatabaseUrl: process.env.VITE_FIREBASE_DATABASE_URL || '',
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.VITE_FIREBASE_APP_ID || '',
      firebaseMeasurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    }
  },
  devtools: { enabled: true }
})
