/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/__tests__/helpers.ts$'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // pnpm + hoisted: transform RN/Expo packages and our TS workspace packages.
  transformIgnorePatterns: [
    'node_modules/(?!(\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|native-base|react-native-svg|@factory/.*|react-native-google-mobile-ads|react-native-purchases|i18next|react-i18next))',
  ],
  // sql.js (WASM) initialisation can be slow on CI/Windows machines.
  testTimeout: 60000,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
