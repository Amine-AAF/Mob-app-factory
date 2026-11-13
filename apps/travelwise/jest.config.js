/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  // First render of RN components is slow on loaded CI/dev machines.
  testTimeout: 30000,
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // pnpm + hoisted: transform RN/Expo packages and our TS workspace packages.
  transformIgnorePatterns: [
    'node_modules/(?!(\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@factory/.*|i18next|react-i18next))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
