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

export const getDb = () => useFirestore()
export const db = null as any // For compatibility, but use getDb()
export const storage = null as any
export const auth = null as any

export default null as any
