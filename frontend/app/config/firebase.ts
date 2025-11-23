export const useFirebaseApp = () => {
  const { $firebaseApp } = useNuxtApp()
  return $firebaseApp
}

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()
  return $firestore
}

export const useAuth = () => {
  const { $auth } = useNuxtApp()
  return $auth
}

export const getDb = () => {
  // This project uses client-side SDK for Firestore; `getDb` should only be called
  // in browser runtime (client) contexts. Defensive guard to make failure explicit
  // during SSR so calling code can be fixed to only run on client.
  if (typeof window === "undefined") {
    throw new Error("getDb() called on server: Firestore client is not available during SSR. Use client-only code or a server admin SDK.");
  }
  return useFirestore()
}
export const db = null as any // For compatibility, but use getDb()
export const storage = null as any
export const auth = null as any

export default null as any
