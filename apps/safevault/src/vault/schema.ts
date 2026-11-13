import { CryptoError } from '@/crypto/errors';

import {
  DEFAULT_CATEGORY_ID,
  IDENTITY_TEMPLATES,
  type AnyMeta,
  type AnySecret,
  type CardBrand,
  type EntryType,
  type IdentityTemplate,
  type MetaByType,
  type PasswordHistoryEntry,
  type SecretByType,
} from './types';

/**
 * Normalisation of decrypted (or user-supplied, or imported) payloads.
 * Decrypted data is authenticated, but it may come from an older app version or a
 * restored backup: every field is type-checked and length-bounded before use.
 */
export const LIMITS = {
  title: 200,
  short: 300,
  url: 2048,
  password: 1024,
  notes: 20_000,
  noteBody: 100_000,
  tag: 40,
  tags: 20,
  history: 50,
} as const;

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

function tags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  // Keep original casing, first occurrence wins, bounded count.
  const out: string[] = [];
  const lower = new Set<string>();
  for (const t of v) {
    const s = str(t, LIMITS.tag).trim();
    if (!s || lower.has(s.toLowerCase())) continue;
    lower.add(s.toLowerCase());
    out.push(s);
    if (out.length >= LIMITS.tags) break;
  }
  return out;
}

const BRANDS: readonly CardBrand[] = ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'maestro', 'other'];

function base(raw: Record<string, unknown>) {
  return {
    title: str(raw.title, LIMITS.title).trim(),
    categoryId: str(raw.categoryId, 64) || DEFAULT_CATEGORY_ID,
    favorite: raw.favorite === true,
    tags: tags(raw.tags),
    lastViewedAt: typeof raw.lastViewedAt === 'number' && Number.isFinite(raw.lastViewedAt) ? raw.lastViewedAt : null,
  };
}

function asRecord(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new CryptoError('malformed');
  return v as Record<string, unknown>;
}

export function normalizeMeta<K extends EntryType>(type: K, value: unknown): MetaByType[K] {
  const raw = asRecord(value);
  const b = base(raw);
  let out: AnyMeta;
  switch (type) {
    case 'login':
      out = { ...b, url: str(raw.url, LIMITS.url).trim(), username: str(raw.username, LIMITS.short), email: str(raw.email, LIMITS.short).trim() };
      break;
    case 'note':
      out = { ...b, format: raw.format === 'simple' ? 'simple' : 'plain' };
      break;
    case 'card': {
      const last4 = str(raw.last4, 4).replace(/\D/g, '');
      out = {
        ...b,
        cardholder: str(raw.cardholder, LIMITS.short),
        brand: BRANDS.includes(raw.brand as CardBrand) ? (raw.brand as CardBrand) : 'other',
        last4,
        expiry: /^\d{2}\/\d{2}$/.test(str(raw.expiry, 5)) ? str(raw.expiry, 5) : '',
      };
      break;
    }
    case 'identity':
      out = { ...b, template: IDENTITY_TEMPLATES.includes(raw.template as IdentityTemplate) ? (raw.template as IdentityTemplate) : 'personal' };
      break;
    default:
      throw new CryptoError('malformed');
  }
  return out as MetaByType[K];
}

function history(v: unknown): PasswordHistoryEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((h) => (h && typeof h === 'object' ? (h as Record<string, unknown>) : null))
    .filter((h): h is Record<string, unknown> => !!h && typeof h.password === 'string')
    .map((h) => ({ password: str(h.password, LIMITS.password), replacedAt: num(h.replacedAt, 0) }))
    .slice(0, LIMITS.history);
}

export function normalizeSecret<K extends EntryType>(type: K, value: unknown, now: number): SecretByType[K] {
  const raw = asRecord(value);
  let out: AnySecret;
  switch (type) {
    case 'login':
      out = {
        password: str(raw.password, LIMITS.password),
        description: str(raw.description, LIMITS.short),
        notes: str(raw.notes, LIMITS.notes),
        passwordUpdatedAt: num(raw.passwordUpdatedAt, now),
        history: history(raw.history),
      };
      break;
    case 'note':
      out = { body: str(raw.body, LIMITS.noteBody) };
      break;
    case 'card':
      out = { number: str(raw.number, 32).replace(/[^\d]/g, ''), notes: str(raw.notes, LIMITS.notes) };
      break;
    case 'identity':
      out = {
        fullName: str(raw.fullName, LIMITS.short),
        address: str(raw.address, 1000),
        phone: str(raw.phone, 64),
        email: str(raw.email, LIMITS.short),
        documentNumber: str(raw.documentNumber, 128),
        issuingCountry: str(raw.issuingCountry, 128),
        issueDate: str(raw.issueDate, 32),
        expiryDate: str(raw.expiryDate, 32),
        dateOfBirth: str(raw.dateOfBirth, 32),
        company: str(raw.company, LIMITS.short),
        jobTitle: str(raw.jobTitle, LIMITS.short),
        extra: str(raw.extra, LIMITS.notes),
      };
      break;
    default:
      throw new CryptoError('malformed');
  }
  return out as SecretByType[K];
}

export function emptySecret<K extends EntryType>(type: K, now: number): SecretByType[K] {
  return normalizeSecret(type, {}, now);
}

export function emptyMeta<K extends EntryType>(type: K, categoryId = DEFAULT_CATEGORY_ID): MetaByType[K] {
  return normalizeMeta(type, { categoryId });
}

export function isEntryType(v: unknown): v is EntryType {
  return v === 'login' || v === 'note' || v === 'card' || v === 'identity';
}
