import { db } from '@/config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import type { DocumentReference, DocumentData, Timestamp } from 'firebase/firestore'
import { ECARD_LIMIT as APP_ECARD_LIMIT } from '@/config/app'

export const ECARD_LIMIT = APP_ECARD_LIMIT

export type ActiveEcardsResult = {
	ids: string[]
	map: Record<string, string>
}

export async function fetchActiveEcards(email: string): Promise<ActiveEcardsResult> {
	if (!email) return { ids: [], map: {} }
	try {
		const normalized = email.trim().toLowerCase();
		// prefer a clear default value; ensure we don't end up with 'undefined/context'
		const envCtx = (import.meta.env.VITE_FIRESTORE ?? '').toString();
		const ctx = envCtx ? envCtx + '/context' : 'context';
	const parts = ctx.split('/').filter(Boolean)
	const ctxRootCollection: string = parts[0] || '4U'
	const ctxRootDocument: string | null = parts.length >= 2 ? (parts[1] || null) : null
	const contextsCol: string = parts.length >= 3 ? (parts[2] || 'context') : (parts[1] || parts[0] || 'context')

		// user document path
		let userDocRef: DocumentReference<DocumentData>
		if (ctxRootDocument) {
			userDocRef = doc(db, ctxRootCollection, ctxRootDocument, 'user', normalized)
		} else if (parts.length === 1 && ctxRootCollection) {
			// If only collection provided in VITE_FIRESTORE (eg. '4U'), use it as root
			userDocRef = doc(db, ctxRootCollection, normalized)
		} else {
			userDocRef = doc(db, 'user', normalized)
		}
		const snap = await getDoc(userDocRef);
		if (!snap.exists()) return { ids: [], map: {} }
		const data = snap.data() as any
		const ecards = data?.ecards || {}
		const ids = Object.keys(ecards || {})
		if (ids.length === 0) return { ids: [], map: {} }

		const now = Date.now()
		const activeChecks = await Promise.all(ids.map(async (key) => {
			try {
				let ctxDocRef: DocumentReference<DocumentData>
				if (ctxRootDocument) ctxDocRef = doc(db, ctxRootCollection, ctxRootDocument, contextsCol, key)
				else ctxDocRef = doc(db, ctxRootCollection, contextsCol, key)
				const s = await getDoc(ctxDocRef);
				if (!s.exists()) return false
				const d = s.data() as any
				const expiresAt = d?.expiresAt as (Timestamp | number | string | undefined)
				if (!expiresAt) return true
				let t = 0
				// Firestore Timestamp
				if (typeof (expiresAt as any)?.toMillis === 'function') t = (expiresAt as Timestamp).toMillis()
				else if (typeof expiresAt === 'number') t = expiresAt
				else t = new Date(expiresAt as string).getTime()
				return t > now
			} catch (e) {
				// be permissive if can't determine
				return true
			}
		}))

		const activeIds = ids.filter((_, i) => activeChecks[i])
		const map: Record<string,string> = {}
		for (const id of activeIds) map[id] = ecards[id]
		return { ids: activeIds, map }
	} catch (_e) {
		return { ids: [], map: {} }
	}
}

// legacy check with explicit limit is removed to shrink API surface; prefer canCreate/getActiveCount above.

// --- Simpler helpers for components: these use the centralized ECARD_LIMIT and return
// a boolean and active count only. Use these to keep component code short and readable.
export async function canCreate(email: string | null | undefined, candidateId?: string | null) {
	if (!email) return { allowed: true, activeCount: 0 }
	const res = await fetchActiveEcards(email)
	const activeCount = res.ids.length
	const allowed = res.ids.includes(candidateId || '') ? true : activeCount < ECARD_LIMIT
	return { allowed, activeCount }
}

export async function getActiveCount(email: string | null | undefined) {
	if (!email) return 0
	const res = await fetchActiveEcards(email)
	return res.ids.length
}

