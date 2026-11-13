#!/usr/bin/env node
/**
 * Scaffolds a new factory app from factory/templates/expo-app and registers it.
 *
 *   pnpm new-app <app-id> "<App Name>" <package.id> [category]
 *   pnpm new-app focus-timer "Focus Timer" com.example.focustimer productivity
 *
 * The new app shares the factory packages and the exact Expo SDK versions
 * already validated by the reference app (DevSpeak), so the whole monorepo
 * stays on one SDK. It starts with only the minimum: add capabilities
 * (SQLite, ads, subscriptions, notifications…) deliberately, per app.
 */
import fs from 'node:fs';
import path from 'node:path';

const [id, name, packageId, category = 'education'] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..', '..');

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!id || !name || !packageId) fail('Usage: pnpm new-app <app-id> "<App Name>" <package.id> [category]');
if (!/^[a-z][a-z0-9-]+$/.test(id)) fail('app-id must be kebab-case');
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageId)) fail('package id must be reverse-DNS, lowercase (e.g. com.company.app)');

const target = path.join(root, 'apps', id);
if (fs.existsSync(target)) fail(`apps/${id} already exists`);

const registryFile = path.join(root, 'factory/app-registry/registry.json');
const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
if (registry.apps.some((a) => a.id === id)) fail(`"${id}" is already registered`);

// Pin the same versions as the reference app so every app stays on one Expo SDK.
const reference = JSON.parse(fs.readFileSync(path.join(root, 'apps/devspeak/package.json'), 'utf8'));
const pick = (deps, names) => Object.fromEntries(names.filter((n) => deps[n]).map((n) => [n, deps[n]]));
const dependencies = {
  ...pick(reference.dependencies, [
    'expo', 'react', 'react-native', 'expo-router', 'expo-linking', 'expo-constants', 'expo-status-bar',
    'expo-splash-screen', 'expo-system-ui', 'expo-build-properties', 'expo-dev-client', 'expo-font',
    '@expo/vector-icons', 'react-native-safe-area-context', 'react-native-screens',
  ]),
  '@factory/app-config': 'workspace:*',
  '@factory/app-core': 'workspace:*',
  '@factory/design-system': 'workspace:*',
};
const devDependencies = pick(reference.devDependencies, ['typescript', '@types/react', 'jest', 'jest-expo', '@testing-library/react-native', 'react-test-renderer']);
devDependencies['@factory/testing'] = 'workspace:*';

const scheme = id.replace(/-/g, '');
const render = (s) =>
  s
    .replaceAll('__APP_ID__', id)
    .replaceAll('__APP_NAME__', name)
    .replaceAll('__PACKAGE_ID__', packageId)
    .replaceAll('__SCHEME__', scheme)
    .replaceAll('__CATEGORY__', category)
    .replace('__DEPENDENCIES__', JSON.stringify(dependencies, null, 4).replace(/\n}/, '\n  }'))
    .replace('__DEV_DEPENDENCIES__', JSON.stringify(devDependencies, null, 4).replace(/\n}/, '\n  }'));

function copy(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name.replace(/\.tpl$/, ''));
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copy(from, to);
    } else {
      fs.writeFileSync(to, render(fs.readFileSync(from, 'utf8')));
    }
  }
}

fs.mkdirSync(target, { recursive: true });
copy(path.join(root, 'factory/templates/expo-app'), target);

registry.apps.push({ id, path: `apps/${id}`, owner: 'TO_ASSIGN', playConsole: { developerAccount: 'TO_CONFIGURE', listingLanguages: ['en-US'] } });
fs.writeFileSync(registryFile, `${JSON.stringify(registry, null, 2)}\n`);

console.log(`✓ Created apps/${id} and registered it.

Next steps:
  1. pnpm install
  2. Edit apps/${id}/app.manifest.json (brand colors, features, monetization, locales)
  3. pnpm brand-assets apps/${id}          (needs sharp, see the script header)
  4. pnpm registry:check
  5. cd apps/${id} && npx expo run:android
See factory/documentation/adding-a-new-app.md`);
