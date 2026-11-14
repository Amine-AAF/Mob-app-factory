import { auditLogins, healthLevel, issueCount, OLD_AFTER_DAYS } from '@/features/audit/audit';
import { detectBrand, formatCardNumber, isExpired, last4Of, looksLikeCvvOrPin, luhnValid, maskCard, normalizeExpiry } from '@/features/cards/cards';
import { parseSimpleFormat } from '@/components/FormattedNote';
import { AMBIGUOUS, clampOptions, DEFAULT_GENERATOR_OPTIONS, generate, generatePassphrase, generatePassword, generatorEntropyBits } from '@/features/generator/generator';
import { clearGeneratedPassword, offerGeneratedPassword, takeGeneratedPassword } from '@/features/generator/handoff';
import { estimateStrength, scoreFromEntropy } from '@/features/generator/strength';
import { WORDS } from '@/features/generator/wordlist';
import { canCreate, FREE_LIMITS, historyLimit, remaining } from '@/features/monetization/plan';
import { filterItems, hostOf, recentlyViewed, safeOpenableUrl } from '@/features/search/search';
import { randomBytes } from '@/crypto/random';
import { shouldLock } from '@/services/autolock';
import { emptyMeta, emptySecret, normalizeMeta, normalizeSecret } from '@/vault/schema';
import type { LoginSecret, VaultItem } from '@/vault/types';

describe('password generator', () => {
  it('respects length and always includes every selected class', () => {
    for (let i = 0; i < 200; i++) {
      const pw = generatePassword({ ...DEFAULT_GENERATOR_OPTIONS, length: 12 });
      expect(pw).toHaveLength(12);
      expect(pw).toMatch(/[a-z]/);
      expect(pw).toMatch(/[A-Z]/);
      expect(pw).toMatch(/\d/);
      expect(pw).toMatch(/[^A-Za-z0-9]/);
      for (const c of AMBIGUOUS) expect(pw).not.toContain(c);
    }
  });

  it('honours disabled classes and never produces an empty alphabet', () => {
    const digitsOnly = generatePassword({ ...DEFAULT_GENERATOR_OPTIONS, lowercase: false, uppercase: false, symbols: false, length: 30 });
    expect(digitsOnly).toMatch(/^[2-9]+$/); // 0 and 1 excluded as ambiguous
    const none = clampOptions({ ...DEFAULT_GENERATOR_OPTIONS, lowercase: false, uppercase: false, digits: false, symbols: false });
    expect(none.lowercase).toBe(true);
  });

  it('clamps length and words', () => {
    expect(generate({ ...DEFAULT_GENERATOR_OPTIONS, length: 2 })).toHaveLength(8);
    expect(generate({ ...DEFAULT_GENERATOR_OPTIONS, length: 500 })).toHaveLength(128);
    expect(clampOptions({ ...DEFAULT_GENERATOR_OPTIONS, words: 99 }).words).toBe(12);
  });

  it('produces distinct values (CSPRNG) with uniform-looking character use', () => {
    const set = new Set(Array.from({ length: 500 }, () => generatePassword(DEFAULT_GENERATOR_OPTIONS)));
    expect(set.size).toBe(500);
    const counts = new Map<string, number>();
    for (let i = 0; i < 300; i++) for (const c of generatePassword({ ...DEFAULT_GENERATOR_OPTIONS, uppercase: false, digits: false, symbols: false, length: 50 })) counts.set(c, (counts.get(c) ?? 0) + 1);
    const values = [...counts.values()];
    expect(Math.min(...values) / Math.max(...values)).toBeGreaterThan(0.7);
  });

  it('generates passphrases from the word list', () => {
    const p = generatePassphrase({ ...DEFAULT_GENERATOR_OPTIONS, mode: 'passphrase', words: 6, separator: '-', capitalize: false, includeNumber: false });
    const parts = p.split('-');
    expect(parts).toHaveLength(6);
    parts.forEach((w) => expect(WORDS).toContain(w));
  });

  it('reports generation entropy', () => {
    expect(generatorEntropyBits({ ...DEFAULT_GENERATOR_OPTIONS, length: 20 })).toBeGreaterThan(110);
    expect(generatorEntropyBits({ ...DEFAULT_GENERATOR_OPTIONS, mode: 'passphrase', words: 6, includeNumber: false })).toBeCloseTo(6 * Math.log2(WORDS.length));
  });

  it('word list is large and unique enough', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(512);
    expect(new Set(WORDS).size).toBe(WORDS.length);
  });

  it('hands off a generated password exactly once', () => {
    offerGeneratedPassword('abc');
    expect(takeGeneratedPassword()).toBe('abc');
    expect(takeGeneratedPassword()).toBeNull();
    offerGeneratedPassword('x');
    clearGeneratedPassword();
    expect(takeGeneratedPassword()).toBeNull();
  });
});

describe('strength estimate', () => {
  it.each([
    ['', 0],
    ['password', 0],
    ['Password1', 0],
    ['qwertyuiop', 0],
    ['aaaaaaaaaaaa', 0],
  ])('rates %p as very weak', (pw, score) => {
    expect(estimateStrength(pw).score).toBe(score);
  });

  it('rates generated passwords as very strong and penalises patterns', () => {
    expect(estimateStrength(generatePassword({ ...DEFAULT_GENERATOR_OPTIONS, length: 20 })).score).toBe(4);
    expect(estimateStrength('Summer2024!').score).toBeLessThanOrEqual(2);
    expect(estimateStrength('Summer2024!').hints).toContain('avoid_years');
    expect(estimateStrength('abcdefgh123').hints).toContain('avoid_patterns');
  });

  it('caps short passwords', () => {
    expect(estimateStrength('X#9q!').score).toBeLessThanOrEqual(1);
    expect(scoreFromEntropy(100)).toBe(4);
    expect(scoreFromEntropy(10)).toBe(0);
  });
});

describe('audit', () => {
  const now = Date.UTC(2026, 10, 13);
  const mk = (id: string, password: string, extra: Partial<LoginSecret> = {}, username = 'u') => ({
    id,
    meta: { ...emptyMeta('login'), title: id, username },
    secret: { ...emptySecret('login', now), password, passwordUpdatedAt: now, ...extra } as LoginSecret,
  });
  const key = randomBytes(32);

  it('finds weak, reused, old and incomplete logins locally', () => {
    const strong = generatePassword(DEFAULT_GENERATOR_OPTIONS);
    const report = auditLogins(
      [mk('a', 'password'), mk('b', strong), mk('c', strong), mk('d', generatePassword(DEFAULT_GENERATOR_OPTIONS), { passwordUpdatedAt: now - (OLD_AFTER_DAYS + 1) * 86_400_000 }), mk('e', '', {}, ''), mk('f', generatePassword(DEFAULT_GENERATOR_OPTIONS))],
      key,
      now,
    );
    expect(report.weak).toEqual(['a']);
    expect(report.reusedGroups).toEqual([['b', 'c']]);
    expect(report.old).toEqual(['d']);
    expect(report.incomplete).toEqual(['e']);
    expect(issueCount(report)).toBe(5);
    expect(report.score).toBeLessThan(100);
    expect(JSON.stringify(report)).not.toContain(strong);
  });

  it('gives 100 when nothing is wrong and handles empty vaults', () => {
    expect(auditLogins([mk('x', generatePassword(DEFAULT_GENERATOR_OPTIONS))], key, now).score).toBe(100);
    expect(healthLevel(auditLogins([], key, now))).toBe('empty');
    expect(healthLevel(null)).toBe('empty');
  });
});

describe('cards', () => {
  it('validates numbers with Luhn and detects brands', () => {
    expect(luhnValid('4111 1111 1111 1111')).toBe(true);
    expect(luhnValid('4111 1111 1111 1112')).toBe(false);
    expect(detectBrand('4111111111111111')).toBe('visa');
    expect(detectBrand('5555555555554444')).toBe('mastercard');
    expect(detectBrand('2221000000000009')).toBe('mastercard');
    expect(detectBrand('378282246310005')).toBe('amex');
    expect(detectBrand('6011111111111117')).toBe('discover');
  });

  it('formats, masks and keeps only the last 4 digits', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    expect(last4Of('4111-1111-1111-1234')).toBe('1234');
    expect(maskCard('1234')).toBe('•••• 1234');
  });

  it('normalises and checks expiry dates', () => {
    expect(normalizeExpiry('0728')).toBe('07/28');
    expect(normalizeExpiry('07/2028')).toBe('07/28');
    expect(normalizeExpiry('13/28')).toBe('');
    expect(isExpired('10/26', new Date(2026, 10, 13))).toBe(true);
    expect(isExpired('11/26', new Date(2026, 10, 13))).toBe(false);
  });

  it('flags CVV / PIN-looking notes', () => {
    expect(looksLikeCvvOrPin('cvv: 123')).toBe(true);
    expect(looksLikeCvvOrPin('PIN 4321')).toBe(true);
    expect(looksLikeCvvOrPin('Card for travel')).toBe(false);
  });

  it('never keeps CVV-like fields: normalised card secret has only number and notes', () => {
    const s = normalizeSecret('card', { number: '4111 1111 1111 1111', cvv: '123', pin: '0000', notes: '' }, 0);
    expect(Object.keys(s).sort()).toEqual(['notes', 'number']);
    expect(s.number).toBe('4111111111111111');
  });
});

describe('schema normalisation', () => {
  it('bounds and type-checks decrypted payloads', () => {
    const m = normalizeMeta('login', { title: 'x'.repeat(1000), tags: ['a', 'A', ' b ', 3, ...Array(30).fill('t')], favorite: 'yes', url: 42 });
    expect(m.title).toHaveLength(200);
    expect(m.tags.slice(0, 3)).toEqual(['a', 'b', 't']);
    expect(m.favorite).toBe(false);
    expect(m.url).toBe('');
    expect(() => normalizeMeta('login', null)).toThrow();
    expect(() => normalizeMeta('login', [])).toThrow();
  });
});

describe('search', () => {
  const item = (id: string, title: string, extra: Partial<VaultItem['meta']> = {}): VaultItem =>
    ({ id, type: 'login', createdAt: 1, updatedAt: Number(id), meta: { ...emptyMeta('login'), title, ...extra } }) as VaultItem;
  const items = [item('1', 'Banque Été', { tags: ['money'] }), item('2', 'GitHub', { favorite: true, lastViewedAt: 50 } as never), item('3', 'Gmail', { lastViewedAt: 99 } as never)];

  it('matches accents-insensitively on meta fields only', () => {
    expect(filterItems(items, { query: 'banque ete' }).map((i) => i.id)).toEqual(['1']);
    expect(filterItems(items, { query: 'money' }).map((i) => i.id)).toEqual(['1']);
    expect(filterItems(items, { favoritesOnly: true }).map((i) => i.id)).toEqual(['2']);
    expect(filterItems(items, { tag: 'MONEY' }).map((i) => i.id)).toEqual(['1']);
    expect(recentlyViewed(items).map((i) => i.id)).toEqual(['3', '2']);
  });

  it('opens only http(s) URLs', () => {
    expect(safeOpenableUrl('example.com')).toBe('https://example.com');
    expect(safeOpenableUrl('http://x.org/a')).toBe('http://x.org/a');
    expect(safeOpenableUrl('javascript:alert(1)')).toBeNull();
    expect(safeOpenableUrl('intent://scan#Intent;end')).toBeNull();
    expect(safeOpenableUrl('file:///sdcard/x')).toBeNull();
    expect(safeOpenableUrl('')).toBeNull();
    expect(hostOf('https://www.example.com/login')).toBe('example.com');
  });
});

describe('free plan limits', () => {
  const logins = Array.from({ length: FREE_LIMITS.login }, (_, i) => ({ id: String(i), type: 'login' }) as VaultItem);
  it('blocks only creation, never access', () => {
    expect(canCreate('login', logins, false)).toBe(false);
    expect(canCreate('login', logins, true)).toBe(true);
    expect(canCreate('note', logins, false)).toBe(true);
    expect(remaining('login', logins, false)).toBe(0);
    expect(remaining('login', logins, true)).toBeNull();
    expect(historyLimit(false)).toBe(1);
    expect(historyLimit(true)).toBe(10);
  });
});

describe('auto-lock policy', () => {
  it('locks after the background timeout and after foreground inactivity', () => {
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: 1000 }, 30, 30_999)).toBe(false);
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: 1000 }, 30, 31_000)).toBe(true);
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: 1000 }, 0, 1000)).toBe(true);
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: null }, 300, 299_000)).toBe(false);
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: null }, 300, 300_000)).toBe(true);
    expect(shouldLock({ lastActivityAt: 0, backgroundedAt: null }, 0, 59_000)).toBe(false);
  });
});

describe('simple note formatting', () => {
  it('parses headings, bullets and bold without HTML', () => {
    const b = parseSimpleFormat('# Codes\n- **one** two\n<b>x</b>');
    expect(b[0]).toEqual({ kind: 'heading', spans: [{ text: 'Codes', bold: false }] });
    expect(b[1]!.kind).toBe('bullet');
    expect(b[1]!.spans[0]).toEqual({ text: 'one', bold: true });
    expect(b[2]!.spans[0]!.text).toBe('<b>x</b>'); // rendered as literal text
  });
});
