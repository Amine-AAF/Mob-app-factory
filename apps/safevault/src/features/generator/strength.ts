import { WORDS } from './wordlist';

/**
 * Informative password strength estimate — run entirely on the device.
 *
 * Method (documented in docs/SECURITY.md §8):
 *  1. Alphabet size from the character classes present (26/26/10/33, +100 for other Unicode).
 *  2. Characters that are part of predictable patterns count for only a quarter:
 *     runs of the same character (aaa), ascending/descending sequences (abc, 321),
 *     keyboard rows (qwerty, azerty, asdf), years 1900–2099, and dictionary words (≥ 4 letters).
 *  3. A list of very common passwords caps the estimate at ~10 bits.
 *  4. entropy ≈ effectiveLength × log2(alphabet); score buckets 0–4.
 *
 * This is a heuristic, not a guarantee: a password can look strong here and still be known
 * to attackers (e.g. leaked elsewhere). The UI says so.
 */
export type StrengthScore = 0 | 1 | 2 | 3 | 4;
export type StrengthHint = 'too_short' | 'add_length' | 'add_variety' | 'avoid_common' | 'avoid_patterns' | 'avoid_words' | 'avoid_years';

export interface StrengthResult {
  score: StrengthScore;
  entropyBits: number;
  hints: StrengthHint[];
}

const COMMON = new Set(
  `123456 123456789 12345678 password qwerty 12345 1234567 111111 123123 abc123 1234567890 password1 000000 iloveyou
  1234 qwerty123 654321 666666 dragon sunshine princess letmein monkey football baseball welcome admin login master
  shadow superman batman trustno1 passw0rd starwars hello freedom whatever qazwsx 121212 michael charlie donald
  azerty soleil motdepasse bonjour contrasena hola123 secret 7777777 987654321 aa123456 1q2w3e4r 1q2w3e qwertyuiop
  zaq12wsx password123 admin123 root toor changeme default guest test test123 123qwe asdfgh asdfghjkl 112233`
    .split(/\s+/)
    .filter(Boolean),
);

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'azertyuiop', 'qsdfghjklm', 'wxcvbn', '1234567890'];
const DICTIONARY = WORDS.filter((w) => w.length >= 4);

function poolSize(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[!-/:-@[-`{-~ ]/.test(pw)) pool += 33;
  if (/[^\x00-\x7F]/.test(pw)) pool += 100;
  return Math.max(pool, 1);
}

/** Marks characters that belong to predictable patterns. */
function patternMask(pw: string): { mask: boolean[]; hints: Set<StrengthHint> } {
  const lower = pw.toLowerCase();
  const mask = new Array<boolean>(pw.length).fill(false);
  const hints = new Set<StrengthHint>();
  const markRange = (start: number, len: number, hint: StrengthHint) => {
    // The first character of a pattern keeps full weight.
    for (let i = start + 1; i < start + len; i++) mask[i] = true;
    hints.add(hint);
  };

  // Repeats and sequences (length ≥ 3).
  let i = 0;
  while (i < lower.length) {
    let j = i + 1;
    while (j < lower.length && lower[j] === lower[i]) j++;
    if (j - i >= 3) markRange(i, j - i, 'avoid_patterns');
    i = j;
  }
  for (const dir of [1, -1]) {
    let start = 0;
    for (let k = 1; k <= lower.length; k++) {
      const ok = k < lower.length && lower.charCodeAt(k) - lower.charCodeAt(k - 1) === dir && /[a-z0-9]/.test(lower[k]!);
      if (!ok) {
        if (k - start >= 3) markRange(start, k - start, 'avoid_patterns');
        start = k;
      }
    }
  }
  for (const row of KEYBOARD_ROWS) {
    for (let len = row.length; len >= 4; len--) {
      for (let s = 0; s + len <= row.length; s++) {
        const frag = row.slice(s, s + len);
        let at = lower.indexOf(frag);
        while (at >= 0) {
          markRange(at, len, 'avoid_patterns');
          at = lower.indexOf(frag, at + 1);
        }
      }
    }
  }
  for (const m of lower.matchAll(/(19|20)\d\d/g)) markRange(m.index ?? 0, 4, 'avoid_years');
  for (const w of DICTIONARY) {
    let at = lower.indexOf(w);
    while (at >= 0) {
      markRange(at, w.length, 'avoid_words');
      at = lower.indexOf(w, at + 1);
    }
  }
  return { mask, hints };
}

export function estimateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, entropyBits: 0, hints: ['too_short'] };
  const hints = new Set<StrengthHint>();
  const lower = password.toLowerCase();
  const pool = poolSize(password);
  const { mask, hints: patternHints } = patternMask(password);
  patternHints.forEach((h) => hints.add(h));
  const effective = mask.reduce((n, m) => n + (m ? 0.25 : 1), 0);
  let entropy = effective * Math.log2(pool);

  if (COMMON.has(lower) || COMMON.has(lower.replace(/[!.?\d]+$/, ''))) {
    entropy = Math.min(entropy, 10);
    hints.add('avoid_common');
  }
  if (password.length < 8) hints.add('too_short');
  else if (password.length < 12) hints.add('add_length');
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  if (classes <= 2 && password.length < 16) hints.add('add_variety');

  let score: StrengthScore = entropy < 28 ? 0 : entropy < 36 ? 1 : entropy < 60 ? 2 : entropy < 80 ? 3 : 4;
  if (password.length < 8 && score > 1) score = 1;
  if (hints.has('avoid_common')) score = 0;
  return { score, entropyBits: Math.round(entropy), hints: [...hints] };
}

/** Converts an entropy figure (from the generator) to the same 0–4 scale. */
export function scoreFromEntropy(bits: number): StrengthScore {
  return bits < 28 ? 0 : bits < 36 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
}
