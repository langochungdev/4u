import { db } from "@/config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// Collection names
const CONTEXTS_COLLECTION = import.meta.env.VITE_FIRESTORE_CONTEXT;
const MEDIA_COLLECTION = import.meta.env.VITE_FIRESTORE_MEDIA;

export interface ContextPayload {
  content: string[];
  images: string[];
  videos?: string[];
  audios?: string[];
  expiresAt?: any; // Timestamp for expiration
}

export interface DeletedMedia {
  urls: string[];
  deletedAt: any;
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

  async saveDeletedMedia(urls: string[]): Promise<void> {
    if (urls.length === 0) return;

    const deleteDocRef = doc(db, MEDIA_COLLECTION, "delete");
    const snapshot = await getDoc(deleteDocRef);
    
    const existingUrls = snapshot.exists() ? (snapshot.data() as DeletedMedia).urls || [] : [];
    await setDoc(deleteDocRef, {
      urls: [...existingUrls, ...urls],
      deletedAt: serverTimestamp(),
    });
  },
};

export const demoid = 'fLFM0pF6lgoPwcjZlwEb';
