/** Collision-resistant local id (no network, no extra dependency). */
export function newId(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** Trims user text and turns empty strings into null. */
export function cleanText(value: string | null | undefined, max = 500): string | null {
  const v = (value ?? '').trim().slice(0, max);
  return v.length ? v : null;
}

/** Light VIN sanity check: 17 chars, no I/O/Q (ISO 3779). Optional field, so only a warning. */
export function looksLikeVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(vin.trim());
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}
