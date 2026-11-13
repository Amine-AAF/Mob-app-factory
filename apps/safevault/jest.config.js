const base = require('../../packages/testing/jest.base.js');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1', '^safevault-native$': '<rootDir>/modules/safevault-native' },
  // @noble/* ship ESM only: let babel transform them like the RN/Expo packages.
  transformIgnorePatterns: [
    'node_modules/(?!(\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@factory/.*|@noble/.*|standard-navigation|i18next|react-i18next|react-native-purchases))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
