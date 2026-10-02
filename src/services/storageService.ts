import type { Story } from '../types/story';
import { APP_CONFIG } from '../config/app';

/**
 * Storage layer.
 *
 * PROTOTYPE: stories live only on this device (IndexedDB, with a localStorage
 * fallback for browsers that block IndexedDB, e.g. some private modes).
 *
 * FUTURE: implement `StoryRepository` with an EU-hosted backend (e.g. Supabase
 * in an EU region or a self-hosted API) and swap it in `createRepository()`.
 * The UI only ever talks to this interface.
 */
export interface StoryRepository {
  readonly kind: 'indexeddb' | 'localstorage' | 'remote';
  list(): Promise<Story[]>;
  get(id: string): Promise<Story | undefined>;
  put(story: Story): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

const STORE = 'stories';

class IndexedDbRepository implements StoryRepository {
  readonly kind = 'indexeddb' as const;
  private db: Promise<IDBDatabase>;

  constructor() {
    this.db = new Promise((resolve, reject) => {
      const req = indexedDB.open(APP_CONFIG.storage.dbName, APP_CONFIG.storage.dbVersion);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('externalTriggerId', 'externalTriggerId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const request = run(t.objectStore(STORE));
      t.oncomplete = () => resolve(request ? (request.result as T) : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  async list() {
    const all = ((await this.tx<Story[]>('readonly', (s) => s.getAll())) ?? []) as Story[];
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string) {
    return (await this.tx<Story>('readonly', (s) => s.get(id))) as Story | undefined;
  }
  async put(story: Story) {
    await this.tx('readwrite', (s) => s.put(story));
  }
  async remove(id: string) {
    await this.tx('readwrite', (s) => s.delete(id));
  }
  async clear() {
    await this.tx('readwrite', (s) => s.clear());
  }
}

class LocalStorageRepository implements StoryRepository {
  readonly kind = 'localstorage' as const;
  private key = 'lumetta.stories.v1';
  private read(): Story[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? '[]') as Story[];
    } catch {
      return [];
    }
  }
  private write(stories: Story[]) {
    localStorage.setItem(this.key, JSON.stringify(stories));
  }
  async list() {
    return this.read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async get(id: string) {
    return this.read().find((s) => s.id === id);
  }
  async put(story: Story) {
    this.write([story, ...this.read().filter((s) => s.id !== story.id)]);
  }
  async remove(id: string) {
    this.write(this.read().filter((s) => s.id !== id));
  }
  async clear() {
    localStorage.removeItem(this.key);
  }
}

let repo: Promise<StoryRepository> | null = null;

export function getRepository(): Promise<StoryRepository> {
  if (!repo) {
    repo = (async () => {
      if (typeof indexedDB !== 'undefined') {
        try {
          const candidate = new IndexedDbRepository();
          await candidate.list();
          return candidate;
        } catch {
          /* fall through */
        }
      }
      return new LocalStorageRepository();
    })();
  }
  return repo;
}

// ── settings (small, synchronous) ─────────────────────────────────────────
export function loadSettings<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storage.settingsKey);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<T>) } : fallback;
  } catch {
    return fallback;
  }
}

export function saveSettings<T>(settings: T) {
  try {
    localStorage.setItem(APP_CONFIG.storage.settingsKey, JSON.stringify(settings));
  } catch {
    /* storage may be unavailable – settings then live for this visit only */
  }
}
