import { db } from "@/config/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// Collection names
const CONTEXTS_COLLECTION = import.meta.env.VITE_FIRESTORE_CONTEXT;

// Validate collection name
if (!CONTEXTS_COLLECTION || CONTEXTS_COLLECTION.trim() === '') {
  throw new Error('VITE_FIRESTORE_CONTEXT is not defined in .env');
}

export interface ContextPayload {
  content: string[];
  images: string[];
  videos?: string[];
  audios?: string[];
  expiresAt?: any; // Timestamp for expiration
}

export const contextService = {
  async create(data: ContextPayload): Promise<string> {
    const docData: any = {
      ...data,
      createdAt: serverTimestamp(),
    };
    
    // Only add expiresAt if it's provided
    if (data.expiresAt) {
      docData.expiresAt = data.expiresAt;
    }
    
    const ref = await addDoc(collection(db, CONTEXTS_COLLECTION), docData);
    return ref.id;
  },

  async getById(id: string): Promise<ContextPayload | null> {
    const snapshot = await getDoc(doc(db, CONTEXTS_COLLECTION, id));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as ContextPayload;
    return {
      content: data.content || [],
      images: data.images || [],
      videos: data.videos || [],
      audios: data.audios || [],
      expiresAt: data.expiresAt || null,
    };
  },

  async update(id: string, data: Partial<ContextPayload>): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Document ID is required for update');
    }
    
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    // Only update expiresAt if it's provided in data
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }
    
    await updateDoc(doc(db, CONTEXTS_COLLECTION, id), updateData);
  },
};
