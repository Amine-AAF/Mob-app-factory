/** Collision-resistant local id (no network, no extra dependency). */
export function newId(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Trims user text and turns empty strings into null. */
export function cleanText(value: string | null | undefined, max = 500): string | null {
  const v = (value ?? '').trim().slice(0, max);
  return v.length ? v : null;
}

/** Parses a non-negative decimal typed with either "," or "." as separator. Empty → null. */
export function parseDecimal(raw: string): number | null {
  const s = raw.replace(',', '.').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Parses a non-negative integer. Empty or invalid → null. */
export function parseInteger(raw: string): number | null {
  const s = raw.trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

/** Lower-cased, accent-free text for search ("Développé" → "developpe"). */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/** Rounds to `step` (e.g. 0.5 kg plates, 0.1 km). */
export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function groupBy<T, K extends string | number>(items: readonly T[], key: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = out.get(k);
    if (list) list.push(item);
    else out.set(k, [item]);
  }
  return out;
}
