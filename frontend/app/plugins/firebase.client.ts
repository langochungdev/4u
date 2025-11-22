import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const config = useRuntimeConfig().public
    
    const firebaseConfig = {
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      databaseURL: config.firebaseDatabaseUrl,
      projectId: config.firebaseProjectId,
      storageBucket: config.firebaseStorageBucket,
      messagingSenderId: config.firebaseMessagingSenderId,
      appId: config.firebaseAppId,
      measurementId: config.firebaseMeasurementId
    }
    
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    // Also set global for non-composable usage
    if (typeof window !== 'undefined') {
      (window as any).firebaseDb = db
    }
    
    return { 
      provide: { 
        firebaseApp: app, 
        firestore: db 
      } 
    }
  }
})