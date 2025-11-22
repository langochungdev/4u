import { doc, setDoc, increment } from "firebase/firestore"

export const useTemplateManager = () => {
  const { $firestore } = useNuxtApp()
  const db = $firestore
  const route = useRoute()

  const prefetchedTemplates = new Set<string>();
  const templateModules = import.meta.glob('~/pages/_templates/*/*/[id].vue') as Record<string, () => Promise<any>>;

  async function prefetchTemplateShell(topic?: string, templateName?: string) {
    const t = templateName || '';
    const top = topic || (route.query.topic as string) || '';
    const key = top ? `${top}/${t}` : t;
    if (!t) return false;
    if (prefetchedTemplates.has(key)) return true;
    try {
      if (top) {
        for (const p in templateModules) {
          if (p.includes(`${top}/${t}/[id].vue`)) {
            const loader = templateModules[p];
            if (typeof loader === 'function') await loader();
            prefetchedTemplates.add(key);
            return true;
          }
        }
      }
      for (const p in templateModules) {
        if (p.includes(`/${t}/[id].vue`)) {
          const loader = templateModules[p];
          if (typeof loader === 'function') await loader();
          prefetchedTemplates.add(key);
          return true;
        }
      }
      try { await import(`~/pages/_templates/${top}/${t}/[id].vue`); prefetchedTemplates.add(key); return true } catch (_e) {}
    } catch (_e) {
    }
    return false;
  }

  // Increment template creation counter in Firestore
  const incrementTemplateStats = async (templateName: string, topic: string) => {
    try {
      // Structure: 4U/develop/template/{topic} with field {templateName}: count
      const config = useRuntimeConfig().public;
      const firestorePath = config.firestore.split('/');
      const topicDocRef = doc(db, firestorePath[0]!, firestorePath[1]!, 'template', topic || 'default');

      // Update the specific template count field
      await setDoc(topicDocRef, {
        [templateName]: increment(1)
      }, { merge: true });
    } catch (err) {
    }
  };

  return {
    prefetchTemplateShell,
    incrementTemplateStats
  }
}