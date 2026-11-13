/**
 * Namespaced key-value store over any AsyncStorage-compatible backend.
 * Used for small, boot-critical preferences (language, theme) that must be
 * readable before the database is open.
 */
export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiRemove(keys: readonly string[]): Promise<void>;
}

export interface KeyValueStore {
  get<T>(key: string, fallback: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  /** Adapter for zustand's `createJSONStorage`. */
  raw: { getItem(k: string): Promise<string | null>; setItem(k: string, v: string): Promise<void>; removeItem(k: string): Promise<void> };
}

export function createKeyValueStore(backend: AsyncStorageLike, namespace: string): KeyValueStore {
  const prefix = `${namespace}:`;
  const k = (key: string) => prefix + key;
  return {
    async get<T>(key: string, fallback: T): Promise<T> {
      const raw = await backend.getItem(k(key));
      if (raw == null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },
    async set<T>(key: string, value: T) {
      await backend.setItem(k(key), JSON.stringify(value));
    },
    async remove(key: string) {
      await backend.removeItem(k(key));
    },
    async clear() {
      const keys = (await backend.getAllKeys()).filter((key) => key.startsWith(prefix));
      if (keys.length) await backend.multiRemove(keys);
    },
    raw: {
      getItem: (key) => backend.getItem(k(key)),
      setItem: (key, v) => backend.setItem(k(key), v),
      removeItem: (key) => backend.removeItem(k(key)),
    },
  };
}

/** In-memory backend for tests and as a fallback. */
export function createMemoryStorage(): AsyncStorageLike {
  const map = new Map<string, string>();
  return {
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => void map.set(key, value),
    removeItem: async (key) => void map.delete(key),
    getAllKeys: async () => [...map.keys()],
    multiRemove: async (keys) => keys.forEach((key) => map.delete(key)),
  };
}
