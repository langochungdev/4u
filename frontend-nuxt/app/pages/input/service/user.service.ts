import { getDb } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';

const USERS_COLLECTION = import.meta.env.VITE_FIRESTORE + '/user';

if (!USERS_COLLECTION || USERS_COLLECTION.trim() === '') {
  throw new Error('VITE_FIRESTORE is not defined in .env');
}

// Lazy get db
const getFirestoreDb = () => {
  const db = getDb();
  if (!db) throw new Error('Firestore not initialized');
  return db;
}

export const userService = {
  async addSendTo(senderEmail: string, recipientEmail: string, qrLink: string): Promise<void> {
    if (!senderEmail || !recipientEmail || !qrLink) return;

    const normalizedSender = senderEmail.trim().toLowerCase();
    const userDocRef = doc(getFirestoreDb(), USERS_COLLECTION, normalizedSender);

    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      const data = {
        createdAt: serverTimestamp(),
        sendto: {
          [recipientEmail]: qrLink
        }
      };
      await setDoc(userDocRef, data);
      return;
    }

    const data = snap.data() || {};
    const sendto = data.sendto || {};
    sendto[recipientEmail] = qrLink;

    await updateDoc(userDocRef, { sendto });
  },

  async addEcardToUser(email: string, resultUrl: string, firestoreRootCollection: string, firestoreRootDocument?: string): Promise<void> {
    console.log('addEcardToUser called with', { email, resultUrl, firestoreRootCollection, firestoreRootDocument });
    if (!email || email.trim() === '' || !resultUrl || resultUrl.trim() === '') return;

    const normalized = email.trim().toLowerCase();
    const extractedId = resultUrl.match(/\/result\/([^?]+)/)?.[1];
    console.log('extractedId', extractedId);
    if (!extractedId) return;

    let docRef;
    if (firestoreRootDocument && firestoreRootDocument.trim() !== '') {
      docRef = doc(getFirestoreDb(), firestoreRootCollection, firestoreRootDocument, 'user', normalized);
    } else {
      docRef = doc(getFirestoreDb(), firestoreRootCollection, normalized);
    }
    console.log('docRef path', docRef.path);

    const ecardsMap = { [extractedId]: resultUrl };

    // Check if doc exists
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Update existing doc
      await updateDoc(docRef, { [`ecards.${extractedId}`]: resultUrl });
    } else {
      // Create new doc
      await setDoc(docRef, { ecards: ecardsMap });
    }
    console.log('operation done');
  },

  async deleteEcardFromUser(email: string, ecardId: string, firestoreRootCollection: string, firestoreRootDocument?: string): Promise<void> {
    if (!email || email.trim() === '' || !ecardId || ecardId.trim() === '') return;

    const normalized = email.trim().toLowerCase();

    let docRef;
    if (firestoreRootDocument && firestoreRootDocument.trim() !== '') {
      docRef = doc(getFirestoreDb(), firestoreRootCollection, firestoreRootDocument, 'user', normalized);
    } else {
      docRef = doc(getFirestoreDb(), firestoreRootCollection, normalized);
    }

    await updateDoc(docRef, { [`ecards.${ecardId}`]: deleteField() });
  },
};
