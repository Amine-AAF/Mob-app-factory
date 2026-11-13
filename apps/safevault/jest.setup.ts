/* Global mocks for native modules that have no Node implementation. */
jest.mock('expo-crypto', () => {
  const nodeCrypto = require('node:crypto');
  return {
    getRandomBytes: (n: number) => new Uint8Array(nodeCrypto.randomBytes(n)),
    randomUUID: () => nodeCrypto.randomUUID(),
  };
});

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    isAvailableAsync: jest.fn(async () => true),
    canUseBiometricAuthentication: jest.fn(() => true),
    setItemAsync: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    deleteItemAsync: jest.fn(async (k: string) => void store.delete(k)),
  };
});

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  getEnrolledLevelAsync: jest.fn(async () => 3),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));

jest.mock('expo-clipboard', () => {
  let value = '';
  return {
    setStringAsync: jest.fn(async (v: string) => {
      value = v;
      return true;
    }),
    getStringAsync: jest.fn(async () => value),
  };
});

jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(async () => undefined),
  allowScreenCaptureAsync: jest.fn(async () => undefined),
}));
