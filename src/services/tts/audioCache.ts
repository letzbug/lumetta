/**
 * Keeps studio narration on the device once it was created, so saved stories
 * can be replayed without new requests (and offline). Separate tiny database
 * so it can be cleared independently of the story library.
 */
const DB = 'lumetta-audio';
const STORE = 'audio';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedAudio(key: string): Promise<Blob | undefined> {
  try {
    const db = await open();
    return await new Promise((resolve) => {
      const r = db.transaction(STORE).objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result as Blob | undefined);
      r.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

export async function putCachedAudio(key: string, blob: Blob) {
  try {
    const db = await open();
    db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, key);
  } catch {
    /* caching is best effort */
  }
}

export async function clearAudioCache() {
  try {
    const db = await open();
    db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
  } catch {
    /* ignore */
  }
}
