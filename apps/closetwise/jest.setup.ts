/* Global mocks for native modules that have no Node implementation. */
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    name: string;
    exists = false;
    constructor(...parts: unknown[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
      this.name = this.uri.split('/').pop() ?? '';
    }
    delete() {}
    create() {}
    async copy() {}
    async write() {}
    async text() {
      return '';
    }
    async base64() {
      return '';
    }
  }
  class Directory extends File {
    list() {
      return [];
    }
  }
  return { File, Directory, Paths: { document: 'file:///doc', cache: 'file:///cache' } };
});

jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: null })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: null })),
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => false), shareAsync: jest.fn() }));
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn(async () => ({ canceled: true, assets: null })) }));
