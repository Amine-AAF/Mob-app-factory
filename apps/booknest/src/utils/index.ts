import { toDayKey } from '@factory/app-core';

/** Random, sortable id (time prefix + random suffix). Generated on device, unique enough for local data. */
export function newId(now: number = Date.now()): string {
  const rand = Math.floor(Math.random() * 0x7fffffff).toString(36).padStart(6, '0');
  return `${now.toString(36)}${rand}`;
}

/**
 * Comparison key for titles, authors, genres: case-, accent- and punctuation-insensitive.
 * "Le Petit Prince", "le petit-prince " and "LE PETIT PRINCE!" share one key.
 */
export function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const v = value.trim();
  return v.length ? v : null;
}

/** Strips separators; returns null when the ISBN has an invalid length or checksum. */
export function normalizeIsbn(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.replace(/[^0-9Xx]/g, '').toUpperCase();
  if (s.length === 10 && /^\d{9}[\dX]$/.test(s)) {
    const sum = s.split('').reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0);
    return sum % 11 === 0 ? s : null;
  }
  if (s.length === 13 && /^\d{13}$/.test(s)) {
    const sum = s.split('').reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
    return sum % 10 === 0 ? s : null;
  }
  return null;
}

/** ISBN-10 → ISBN-13 so both forms of the same edition compare equal. */
export function isbnTo13(isbn: string): string {
  if (isbn.length === 13) return isbn;
  const core = `978${isbn.slice(0, 9)}`;
  const sum = core.split('').reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return `${core}${(10 - (sum % 10)) % 10}`;
}

export function isDayKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime()) && toDayKey(d) === value;
}

export function parseIntOrNull(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** "12,50" or "12.5" → 1250 cents. Returns null for empty/invalid. */
export function parseMoneyToCents(value: string | null | undefined): number | null {
  if (value == null) return null;
  const s = value.trim().replace(/\s/g, '').replace(',', '.');
  if (!s) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

export function centsToInput(cents: number | null): string {
  return cents == null ? '' : (cents / 100).toFixed(2);
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Parses an "h:mm:ss", "mm:ss" or minutes string into seconds. */
export function parseDuration(value: string): number | null {
  const s = value.trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s) * 60;
  const parts = s.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  const [h, m, sec] = nums.length === 3 ? (nums as [number, number, number]) : [0, nums[0]!, nums[1]!];
  if (m >= 60 && nums.length === 3) return null;
  if (sec >= 60) return null;
  return h * 3600 + m * 60 + sec;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Session duration typed as "h:mm" (or plain minutes) → seconds. */
export function parseHoursMinutes(value: string): number | null {
  const s = value.trim();
  if (/^\d+$/.test(s)) return Number(s) * 60;
  const m = s.match(/^(\d{1,2})[:h](\d{2})$/);
  if (!m || Number(m[2]) > 59) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60;
}
