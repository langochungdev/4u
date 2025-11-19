import { db } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const USERS_COLLECTION = import.meta.env.VITE_FIRESTORE + '/user';

if (!USERS_COLLECTION || USERS_COLLECTION.trim() === '') {
  throw new Error('VITE_FIRESTORE is not defined in .env');
}

export const userService = {
  async addSendTo(senderEmail: string, recipientEmail: string, qrLink: string): Promise<void> {
    if (!senderEmail || !recipientEmail || !qrLink) return;

    const normalizedSender = senderEmail.trim().toLowerCase();
    const userDocRef = doc(db, USERS_COLLECTION, normalizedSender);

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
};
