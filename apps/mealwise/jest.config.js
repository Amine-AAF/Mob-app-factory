/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // UI tests render full screens with an in-memory SQLite database: allow a cold transform cache.
  testTimeout: 30000,
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // pnpm + hoisted: transform RN/Expo packages and our TS workspace packages.
  transformIgnorePatterns: [
    'node_modules/(?!(\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@factory/.*|standard-navigation|react-native-google-mobile-ads|react-native-purchases|i18next|react-i18next))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/content/recipes/**'],
};
