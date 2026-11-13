/**
 * Validates every app manifest listed in the registry and prints a summary.
 * Run with: node factory/scripts/check-registry.ts   (Node >= 22.18 strips types natively)
 */
import fs from 'node:fs';
import path from 'node:path';

import { appManifestSchema } from '../../packages/app-config/src/index.ts';

interface RegistryEntry {
  id: string;
  path: string;
}

const root = path.resolve(import.meta.dirname, '..', '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'factory/app-registry/registry.json'), 'utf8')) as { apps: RegistryEntry[] };

const errors: string[] = [];
const seen = { ids: new Set<string>(), packages: new Set<string>() };
const rows: string[] = [];

for (const entry of registry.apps) {
  const file = path.join(root, entry.path, 'app.manifest.json');
  if (!fs.existsSync(file)) {
    errors.push(`${entry.id}: missing ${path.relative(root, file)}`);
    continue;
  }
  const parsed = appManifestSchema.safeParse(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (!parsed.success) {
    errors.push(`${entry.id}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    continue;
  }
  const m = parsed.data;
  if (m.id !== entry.id) errors.push(`${entry.id}: manifest id "${m.id}" does not match registry id`);
  if (seen.ids.has(m.id)) errors.push(`${m.id}: duplicate app id`);
  if (seen.packages.has(m.packageId)) errors.push(`${m.id}: duplicate package id ${m.packageId}`);
  if (!m.locales.includes(m.defaultLocale)) errors.push(`${m.id}: defaultLocale not in locales`);
  for (const lng of m.locales) {
    const loc = path.join(root, entry.path, 'src/i18n/locales', `${lng}.json`);
    if (!fs.existsSync(loc)) errors.push(`${m.id}: missing locale file ${lng}.json`);
  }
  seen.ids.add(m.id);
  seen.packages.add(m.packageId);
  rows.push(`${m.id.padEnd(14)} ${m.packageId.padEnd(26)} v${m.version.padEnd(8)} ${m.monetization.model.padEnd(13)} ${m.locales.join(',').padEnd(10)} ${m.releaseStatus}`);
}

console.log(`${'APP'.padEnd(14)} ${'PACKAGE'.padEnd(26)} ${'VERSION'.padEnd(9)} ${'MONETIZATION'.padEnd(13)} ${'LOCALES'.padEnd(10)} STATUS`);
rows.forEach((r) => console.log(r));
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`\n✓ ${rows.length} app(s) valid`);
