/* Global mocks for native modules that have no Node implementation. */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

/**
 * In-memory expo-file-system (new File/Directory API subset used by services/files.ts).
 * `global.__fs` exposes the backing map so tests can simulate a deleted file.
 */
jest.mock('expo-file-system', () => {
  const store = new Map<string, string>();
  const dirs = new Set<string>(['file:///doc', 'file:///cache']);
  (globalThis as unknown as { __fs: unknown }).__fs = { store, dirs };
  const join = (...parts: unknown[]) =>
    parts
      .map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri))
      .join('/')
      .replace(/([^:])\/{2,}/g, '$1/');
  class Directory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(...parts);
    }
    get exists() {
      return dirs.has(this.uri);
    }
    create() {
      dirs.add(this.uri);
    }
    delete() {
      for (const k of [...store.keys()]) if (k.startsWith(`${this.uri}/`)) store.delete(k);
      for (const d of [...dirs]) if (d === this.uri || d.startsWith(`${this.uri}/`)) dirs.delete(d);
    }
    list() {
      return [...store.keys()].filter((k) => k.slice(0, k.lastIndexOf('/')) === this.uri).map((k) => new File(k));
    }
  }
  class File {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(...parts);
    }
    get name() {
      return this.uri.slice(this.uri.lastIndexOf('/') + 1);
    }
    get exists() {
      return store.has(this.uri);
    }
    get size() {
      return store.get(this.uri)?.length ?? 0;
    }
    get contentUri() {
      return this.uri.replace('file://', 'content://');
    }
    create() {
      store.set(this.uri, '');
    }
    write(content: string) {
      store.set(this.uri, content);
    }
    async text() {
      return store.get(this.uri) ?? '';
    }
    delete() {
      store.delete(this.uri);
    }
    async copy(target: File) {
      if (!store.has(this.uri)) throw new Error('missing');
      store.set(target.uri, store.get(this.uri) as string);
    }
    async move(target: File) {
      await this.copy(target);
      store.delete(this.uri);
    }
    async canPreview() {
      return true;
    }
    async preview() {
      return undefined;
    }
  }
  return { File, Directory, Paths: { document: new Directory('file:///doc'), cache: new Directory('file:///cache') } };
});

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));

jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => undefined) }));

jest.mock('expo-print', () => ({ printToFileAsync: jest.fn(async () => ({ uri: 'file:///cache/print.pdf' })) }));

jest.mock('expo-notifications', () => {
  const scheduled: { identifier: string; content: unknown; trigger: unknown }[] = [];
  (globalThis as unknown as { __notifications: unknown }).__notifications = scheduled;
  return {
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(async () => null),
    getPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
    requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getAllScheduledNotificationsAsync: jest.fn(async () => [...scheduled]),
    cancelScheduledNotificationAsync: jest.fn(async (id: string) => {
      const i = scheduled.findIndex((n) => n.identifier === id);
      if (i >= 0) scheduled.splice(i, 1);
    }),
    scheduleNotificationAsync: jest.fn(async (req: { identifier?: string; content: unknown; trigger: unknown }) => {
      const identifier = req.identifier ?? `n-${scheduled.length}`;
      const i = scheduled.findIndex((n) => n.identifier === identifier);
      if (i >= 0) scheduled.splice(i, 1);
      scheduled.push({ identifier, content: req.content, trigger: req.trigger });
      return identifier;
    }),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    getLastNotificationResponseAsync: jest.fn(async () => null),
    AndroidImportance: { DEFAULT: 3, HIGH: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', TIME_INTERVAL: 'timeInterval' },
  };
});
