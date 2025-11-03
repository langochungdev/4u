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

export interface LetterPayload {
  title: string;
  content: string;
  images: string[];
  videos?: string[];
  audios?: string[];
}

export interface DeletedMedia {
  urls: string[];
  deletedAt: any;
}

export const letterService = {
  async create(data: LetterPayload): Promise<string> {
    const ref = await addDoc(collection(db, "letters"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async getById(id: string): Promise<LetterPayload | null> {
    const snapshot = await getDoc(doc(db, "letters", id));
    if (!snapshot.exists()) return null;

    const data = snapshot.data() as LetterPayload;
    return {
      title: data.title || "",
      content: data.content || "",
      images: data.images || [],
      videos: data.videos || [],
      audios: data.audios || [],
    };
  },

  async update(id: string, data: Partial<LetterPayload>): Promise<void> {
    await updateDoc(doc(db, "letters", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async saveDeletedMedia(urls: string[]): Promise<void> {
    if (urls.length === 0) return;

    const deleteDocRef = doc(db, "media", "delete");
    const snapshot = await getDoc(deleteDocRef);
    
    const existingUrls = snapshot.exists() ? (snapshot.data() as DeletedMedia).urls || [] : [];
    await setDoc(deleteDocRef, {
      urls: [...existingUrls, ...urls],
      deletedAt: serverTimestamp(),
    });
  },
};
