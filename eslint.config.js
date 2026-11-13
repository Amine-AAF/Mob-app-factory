// Flat ESLint config shared by every app and package in the factory.
const expoConfig = require('eslint-config-expo/flat');

const globals = require('globals');

module.exports = [
  ...expoConfig,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.expo/**', '**/android/**', '**/ios/**', '**/coverage/**', 'apps/*/expo-env.d.ts'],
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-unresolved': 'off', // TypeScript resolves workspace + path aliases
      'import/namespace': 'off', // false positives on re-exported enums; TypeScript checks this
    },
  },
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', '**/jest.setup.ts'],
    rules: { 'no-console': 'off', '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Node CLI scripts: console output is their UI.
    files: ['factory/scripts/**'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
];
