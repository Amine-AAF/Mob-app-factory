import fs from 'fs';
import path from 'path';

/**
 * Static security checks on the source tree and the dependency list.
 * They complement — not replace — the manual checklist in docs/SECURITY-CHECKLIST.md.
 */
const root = path.join(__dirname, '..', '..');
const files: string[] = [];
const walk = (dir: string) =>
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '__tests__', 'android', '.expo'].includes(e.name)) walk(p);
    else if (/\.(tsx?|kt)$/.test(e.name)) files.push(p);
  });
['app', 'src', 'modules'].forEach((d) => walk(path.join(root, d)));
const read = (f: string) => fs.readFileSync(f, 'utf8');
const rel = (f: string) => path.relative(root, f).replace(/\\/g, '/');

describe('no secrets in logs', () => {
  it('only services/log.ts and the i18n missing-key hook call console.*', () => {
    const offenders = files.filter((f) => /\bconsole\.(log|info|warn|error|debug)\(/.test(read(f))).map(rel);
    expect(offenders.sort()).toEqual(['src/i18n/index.ts', 'src/services/log.ts']);
  });

  it('native code never logs', () => {
    for (const f of files.filter((x) => x.endsWith('.kt'))) expect(read(f)).not.toMatch(/\bLog\.[dviwe]\(|println\(/);
  });

  it('logEvent is only called with literal event codes', () => {
    for (const f of files) {
      for (const m of read(f).matchAll(/logEvent\(([^,)]+)/g)) {
        if (rel(f) === 'src/services/log.ts') continue;
        expect(m[1]!.trim()).toMatch(/^'[a-z_]+'$/);
      }
    }
  });
});

describe('no tracking or ads', () => {
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

  it('ships no ads, analytics or crash-reporting SDK', () => {
    const banned = /google-mobile-ads|admob|analytics|firebase|sentry|bugsnag|crashlytics|amplitude|mixpanel|segment|appsflyer|adjust|datadog/i;
    expect(deps.filter((d) => banned.test(d))).toEqual([]);
    for (const f of files) expect(read(f)).not.toMatch(/@factory\/analytics|react-native-google-mobile-ads/);
  });

  it('pins cryptographic libraries to exact versions', () => {
    expect(pkg.dependencies['@noble/hashes']).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.dependencies['@noble/ciphers']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('never uses Math.random or a plain hash as KDF', () => {
    for (const f of files) {
      expect(read(f)).not.toMatch(/Math\.random\(/);
      expect(read(f)).not.toMatch(/pbkdf2|createHash\(['"]sha256/);
    }
  });

  it('never sends data over the network from app code', () => {
    for (const f of files) expect(read(f)).not.toMatch(/\bfetch\(|XMLHttpRequest|axios|WebSocket\(/);
  });
});

describe('Android configuration', () => {
  const config = read(path.join(root, 'app.config.ts'));
  it('disables Android auto-backup and blocks unneeded permissions', () => {
    expect(config).toMatch(/allowBackup:\s*false/);
    for (const p of ['READ_EXTERNAL_STORAGE', 'CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'SYSTEM_ALERT_WINDOW', 'POST_NOTIFICATIONS', 'AD_ID']) expect(config).toContain(p);
    expect(config).not.toMatch(/expo-notifications|google-mobile-ads/);
  });

  it('does not pass secrets through navigation params', () => {
    for (const f of files.filter((x) => rel(x).startsWith('app/'))) {
      for (const m of read(f).matchAll(/params:\s*\{([^}]*)\}/g)) expect(m[1]).not.toMatch(/password|secret|number|body/i);
    }
  });
});
