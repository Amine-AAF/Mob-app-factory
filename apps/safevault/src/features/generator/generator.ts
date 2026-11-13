import { randomInt, secureShuffle } from '@/crypto/random';

import { WORDS } from './wordlist';

/**
 * Password and passphrase generator. All randomness comes from the CSPRNG
 * (crypto/random.ts) with rejection sampling: every character/word is uniformly likely.
 */
export interface GeneratorOptions {
  mode: 'password' | 'passphrase';
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  mode: 'password',
  length: 20,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: true,
  words: 5,
  separator: '-',
  capitalize: true,
  includeNumber: true,
};

export const LENGTH_RANGE = { min: 8, max: 128 } as const;
export const WORDS_RANGE = { min: 3, max: 12 } as const;
export const SEPARATORS = ['-', '.', '_', ' ', '#'] as const;

const SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?~|',
} as const;

/** Characters easily confused when read or typed by hand. */
export const AMBIGUOUS = 'Il1O0o|';

export function charsetFor(opts: Pick<GeneratorOptions, 'lowercase' | 'uppercase' | 'digits' | 'symbols' | 'excludeAmbiguous'>): string[] {
  return (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((k) => opts[k])
    .map((k) => (opts.excludeAmbiguous ? [...SETS[k]].filter((c) => !AMBIGUOUS.includes(c)).join('') : SETS[k]));
}

export function clampOptions(opts: GeneratorOptions): GeneratorOptions {
  const o = { ...opts };
  o.length = Math.min(LENGTH_RANGE.max, Math.max(LENGTH_RANGE.min, Math.round(o.length) || DEFAULT_GENERATOR_OPTIONS.length));
  o.words = Math.min(WORDS_RANGE.max, Math.max(WORDS_RANGE.min, Math.round(o.words) || DEFAULT_GENERATOR_OPTIONS.words));
  if (!o.lowercase && !o.uppercase && !o.digits && !o.symbols) o.lowercase = true; // never an empty alphabet
  if (!(SEPARATORS as readonly string[]).includes(o.separator)) o.separator = '-';
  return o;
}

/** Random password containing at least one character of every selected class. */
export function generatePassword(input: GeneratorOptions): string {
  const opts = clampOptions(input);
  const sets = charsetFor(opts);
  const all = sets.join('');
  const chars = sets.map((s) => s[randomInt(s.length)]!);
  while (chars.length < opts.length) chars.push(all[randomInt(all.length)]!);
  return secureShuffle(chars).join('');
}

export function generatePassphrase(input: GeneratorOptions): string {
  const opts = clampOptions(input);
  const words = Array.from({ length: opts.words }, () => {
    const w = WORDS[randomInt(WORDS.length)]!;
    return opts.capitalize ? w[0]!.toUpperCase() + w.slice(1) : w;
  });
  if (opts.includeNumber) {
    const i = randomInt(words.length);
    words[i] = `${words[i]}${randomInt(10)}`;
  }
  return words.join(opts.separator);
}

export function generate(opts: GeneratorOptions): string {
  return opts.mode === 'passphrase' ? generatePassphrase(opts) : generatePassword(opts);
}

/**
 * Entropy of the *generation process* in bits (what an attacker who knows the settings faces).
 * Password: length × log2(alphabet), slightly over-estimated by the "one of each class" rule
 * (the difference is < 1 bit for usual settings). Passphrase: words × log2(list size),
 * plus the digit and its position when `includeNumber` is set.
 */
export function generatorEntropyBits(input: GeneratorOptions): number {
  const opts = clampOptions(input);
  if (opts.mode === 'passphrase') {
    let bits = opts.words * Math.log2(WORDS.length);
    if (opts.includeNumber) bits += Math.log2(10) + Math.log2(opts.words);
    return bits;
  }
  return opts.length * Math.log2(charsetFor(opts).join('').length);
}
