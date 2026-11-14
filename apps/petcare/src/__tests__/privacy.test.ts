import fs from 'fs';
import path from 'path';

import manifest from '../../app.manifest.json';

const APP = path.join(__dirname, '..', '..', 'app');
const SRC = path.join(__dirname, '..');

function files(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' ? [] : files(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const all = [...files(APP), ...files(SRC)];
const read = (p: string) => fs.readFileSync(p, 'utf8');

describe('offline-first & privacy guarantees', () => {
  it('makes no network call from app code (no fetch, XHR, upload or download)', () => {
    const offenders = all.filter((f) => /\bfetch\(|XMLHttpRequest|\.upload\(|createUploadTask|downloadFileAsync|axios/.test(read(f)));
    expect(offenders).toEqual([]);
  });

  it('never logs with console.log (no personal data in logs)', () => {
    expect(all.filter((f) => /console\.log\(/.test(read(f)))).toEqual([]);
  });

  it('never shows ads on documents, health, treatment or data-entry screens', () => {
    const allowed = new Set(['index.tsx', 'pets.tsx', 'care.tsx'].map((f) => path.join(APP, '(tabs)', f)));
    const withAds = files(APP).filter((f) => /<AdBanner\b/.test(read(f)));
    expect(withAds.length).toBeGreaterThan(0);
    for (const f of withAds) expect(allowed.has(f)).toBe(true);
  });

  it('tracks only anonymous event parameters', () => {
    const src = read(path.join(SRC, 'services', 'analytics.ts'));
    const params = [...src.matchAll(/params: \{([^}]*)\}/g)].flatMap((m) => m[1]!.split(';').map((p) => p.split(':')[0]!.trim()).filter(Boolean));
    expect(params.length).toBeGreaterThan(0);
    for (const p of params) expect(['species', 'ui_language', 'kind', 'template_id', 'format', 'source', 'plan']).toContain(p);
  });

  it('only stores files inside the app private directories', () => {
    const src = read(path.join(SRC, 'services', 'files.ts'));
    expect(src).toContain('Paths.document');
    expect(src).not.toMatch(/Paths\.(bundle|appleSharedContainers)/);
    expect(src).toMatch(/SAFE_NAME/);
  });

  it('blocks unneeded Android permissions and Google auto-backup', () => {
    const config = read(path.join(__dirname, '..', '..', 'app.config.ts'));
    for (const perm of ['CAMERA', 'RECORD_AUDIO', 'READ_MEDIA_IMAGES', 'ACCESS_FINE_LOCATION', 'READ_EXTERNAL_STORAGE']) expect(config).toContain(`android.permission.${perm}`);
    expect(config).toContain('allowBackup: false');
  });

  it('uses Google test ad IDs outside production', () => {
    const config = read(path.join(__dirname, '..', '..', 'app.config.ts'));
    expect(config).toContain('ca-app-pub-3940256099942544~3347511713');
    expect(read(path.join(SRC, 'services', 'ads.ts'))).toContain("isDev: variant !== 'production'");
  });

  it('declares the indicative prices of the brief', () => {
    const plans = manifest.monetization.subscriptions.plans;
    expect(plans.map((p) => [p.period, p.indicativePriceUsd])).toEqual([
      ['monthly', 2.99],
      ['annual', 17.99],
      ['lifetime', 29.99],
    ]);
  });
});
