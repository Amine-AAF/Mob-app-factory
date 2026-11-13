/**
 * Page range parsing for split / extract ("1-3, 5, 8-").
 * Input is 1-based (what users see); output page indices are 0-based (what pdf-lib uses).
 */
export type RangeError = 'empty' | 'syntax' | 'out_of_range' | 'reversed';

export type ParsedRanges = { ok: true; groups: number[][]; pages: number[] } | { ok: false; error: RangeError };

const MAX_INPUT_LENGTH = 500;
const PART = /^(\d+)?(?:([-–])(\d+)?)?$/;

export function parsePageRanges(input: string, pageCount: number): ParsedRanges {
  const text = input.trim();
  if (!text) return { ok: false, error: 'empty' };
  if (text.length > MAX_INPUT_LENGTH) return { ok: false, error: 'syntax' };
  const groups: number[][] = [];
  for (const rawPart of text.split(/[,;]/)) {
    const part = rawPart.replace(/\s+/g, '');
    if (!part) continue;
    const m = PART.exec(part);
    if (!m || (!m[1] && !m[3])) return { ok: false, error: 'syntax' };
    const isRange = Boolean(m[2]);
    const start = m[1] ? Number(m[1]) : 1;
    const end = isRange ? (m[3] ? Number(m[3]) : pageCount) : start;
    if (start < 1 || end < 1 || start > pageCount || end > pageCount) return { ok: false, error: 'out_of_range' };
    if (end < start) return { ok: false, error: 'reversed' };
    const group: number[] = [];
    for (let p = start; p <= end; p++) group.push(p - 1);
    groups.push(group);
  }
  if (!groups.length) return { ok: false, error: 'empty' };
  // Flattened, de-duplicated, in the order the user typed.
  const seen = new Set<number>();
  const pages: number[] = [];
  for (const g of groups) {
    for (const p of g) {
      if (!seen.has(p)) {
        seen.add(p);
        pages.push(p);
      }
    }
  }
  return { ok: true, groups, pages };
}

/** Compact 1-based label for a set of 0-based page indices: [0,1,2,4] -> "1-3, 5". */
export function formatPageRanges(pages: readonly number[]): string {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    const start = sorted[i] as number;
    let end = start;
    while (i + 1 < sorted.length && sorted[i + 1] === end + 1) {
      i++;
      end = sorted[i] as number;
    }
    parts.push(start === end ? `${start + 1}` : `${start + 1}-${end + 1}`);
    i++;
  }
  return parts.join(', ');
}

/** One group per page: used by "split every page". */
export function everyPage(pageCount: number): number[][] {
  return Array.from({ length: pageCount }, (_, i) => [i]);
}

/** Fixed-size chunks: used by "split every N pages". */
export function chunkPages(pageCount: number, size: number): number[][] {
  const n = Math.max(1, Math.floor(size));
  const out: number[][] = [];
  for (let s = 0; s < pageCount; s += n) out.push(Array.from({ length: Math.min(n, pageCount - s) }, (_, i) => s + i));
  return out;
}
