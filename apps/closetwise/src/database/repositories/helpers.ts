import { fromJson, type SqlValue } from '@factory/storage';

import { clock } from '@/services/clock';

export const nowIso = () => clock.now().toISOString();
export const bool = (v: unknown) => v === 1 || v === true;
export const int = (b: boolean | null | undefined): number | null => (b == null ? null : b ? 1 : 0);
export const strArray = (raw: unknown): string[] => fromJson<unknown>(typeof raw === 'string' ? raw : null, []) as string[];

/** Trims user text; empty strings are stored as NULL. */
export function clean(s: string | null | undefined): string | null {
  const t = (s ?? '').trim();
  return t.length ? t : null;
}

export type Row = Record<string, SqlValue>;
