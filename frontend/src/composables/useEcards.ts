import { db } from '@/config/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Central client-side limit for active eCards. Use env var if present otherwise default to 2.
export const ECARD_LIMIT = (() => {
	const v = Number(import.meta.env.VITE_ECARD_LIMIT)
	return Number.isFinite(v) && v > 0 ? Math.floor(v) : 15
})()

export type ActiveEcardsResult = {
	ids: string[]
	map: Record<string, string>
}

export async function fetchActiveEcards(email: string): Promise<ActiveEcardsResult> {
	if (!email) return { ids: [], map: {} }
	try {
		const normalized = email.trim().toLowerCase();
		const ctx = (import.meta.env.VITE_FIRESTORE_CONTEXT || '').toString();
		const parts = ctx.split('/').filter(Boolean);
		const ctxRootCollection = parts[0] || '4U';
		const ctxRootDocument = parts.length >= 2 ? parts[1] : null;
		const contextsCol = parts.length >= 3 ? parts[2] : (parts[1] || parts[0] || 'context');

		// user document path
		let userDocRef;
		if (parts.length >= 2) {
			userDocRef = doc(db, parts[0], parts[1], 'user', normalized);
		} else if (parts.length === 1) {
			userDocRef = doc(db, parts[0], normalized);
		} else {
			userDocRef = doc(db, 'user', normalized);
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
				let ctxDocRef;
				if (ctxRootDocument) ctxDocRef = doc(db, ctxRootCollection, ctxRootDocument, contextsCol, key);
				else ctxDocRef = doc(db, ctxRootCollection, contextsCol, key);
				const s = await getDoc(ctxDocRef);
				if (!s.exists()) return false
				const d = s.data() as any
				const expiresAt = d?.expiresAt
				if (!expiresAt) return true
				const t = expiresAt.seconds ? expiresAt.seconds * 1000 : new Date(expiresAt).getTime()
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

