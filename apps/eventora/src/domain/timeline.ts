import { formatHm, MINUTES_PER_DAY, parseHm } from './time';
import type { TimelineItem } from './types';

/**
 * Event programme. Times are minutes from 00:00 of the event start date, so an
 * activity from 23:30 to 00:30 is stored as 1410 → 1470 and sorts correctly.
 */

/**
 * Converts form values to minutes. `startNextDay` marks a start after midnight
 * (e.g. "01:00 next day"). An end earlier than or equal to the start is taken
 * as the following day.
 */
export function toSpan(start: string, end: string, startNextDay = false): { startMin: number; endMin: number } {
  const s = parseHm(start) + (startNextDay ? MINUTES_PER_DAY : 0);
  let e = parseHm(end) + (startNextDay ? MINUTES_PER_DAY : 0);
  if (e <= s) e += MINUTES_PER_DAY;
  return { startMin: s, endMin: e };
}

export function spanLabel(item: Pick<TimelineItem, 'startMin' | 'endMin'>): { start: string; end: string; startNextDay: boolean; endNextDay: boolean } {
  return {
    start: formatHm(item.startMin),
    end: formatHm(item.endMin),
    startNextDay: item.startMin >= MINUTES_PER_DAY,
    endNextDay: item.endMin >= MINUTES_PER_DAY,
  };
}

export function durationMin(item: Pick<TimelineItem, 'startMin' | 'endMin'>): number {
  return Math.max(0, item.endMin - item.startMin);
}

/** Chronological order; ties keep the user's manual order. */
export function sortTimeline<T extends Pick<TimelineItem, 'startMin' | 'endMin' | 'sortOrder'>>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.startMin - b.startMin || a.sortOrder - b.sortOrder || a.endMin - b.endMin);
}

export interface Overlap {
  a: string;
  b: string;
  minutes: number;
}

/** Every pair of activities whose intervals intersect (touching ends do not count). */
export function findOverlaps(items: readonly Pick<TimelineItem, 'id' | 'startMin' | 'endMin' | 'sortOrder'>[]): Overlap[] {
  const sorted = sortTimeline(items);
  const out: Overlap[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i]!;
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j]!;
      if (b.startMin >= a.endMin) break;
      out.push({ a: a.id, b: b.id, minutes: Math.min(a.endMin, b.endMin) - b.startMin });
    }
  }
  return out;
}

export function overlappingIds(items: readonly Pick<TimelineItem, 'id' | 'startMin' | 'endMin' | 'sortOrder'>[]): Set<string> {
  return new Set(findOverlaps(items).flatMap((o) => [o.a, o.b]));
}

/** Gaps of free time between consecutive activities (≥ minGap minutes). */
export function findGaps(items: readonly Pick<TimelineItem, 'startMin' | 'endMin' | 'sortOrder'>[], minGap = 30): { fromMin: number; toMin: number }[] {
  const sorted = sortTimeline(items);
  const gaps: { fromMin: number; toMin: number }[] = [];
  let cursor = sorted[0]?.endMin ?? 0;
  for (const it of sorted.slice(1)) {
    if (it.startMin - cursor >= minGap) gaps.push({ fromMin: cursor, toMin: it.startMin });
    cursor = Math.max(cursor, it.endMin);
  }
  return gaps;
}

/**
 * Moves an item up/down in the programme. Because the list is chronological,
 * moving swaps the time slots of the two activities (each keeps its duration).
 */
export function moveItem<T extends Pick<TimelineItem, 'id' | 'startMin' | 'endMin' | 'sortOrder'>>(items: readonly T[], id: string, direction: -1 | 1): T[] {
  const sorted = sortTimeline(items);
  const i = sorted.findIndex((x) => x.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= sorted.length) return sorted;
  const a = sorted[i]!;
  const b = sorted[j]!;
  const first = direction === 1 ? a : b; // earlier item
  const second = direction === 1 ? b : a;
  const firstStart = first.startMin;
  // second moves to first's start; first follows right after second, preserving gaps when possible.
  const newSecond = { ...second, startMin: firstStart, endMin: firstStart + durationMin(second) };
  const gap = Math.max(0, second.startMin - first.endMin);
  const newFirst = { ...first, startMin: newSecond.endMin + gap, endMin: newSecond.endMin + gap + durationMin(first) };
  const result = sorted.map((x) => (x.id === first.id ? newFirst : x.id === second.id ? newSecond : x));
  return sortTimeline(result).map((x, idx) => ({ ...x, sortOrder: idx }));
}

/** Shifts every activity by `delta` minutes (e.g. the ceremony starts 30 min late). */
export function shiftAll<T extends Pick<TimelineItem, 'startMin' | 'endMin'>>(items: readonly T[], delta: number): T[] {
  return items.map((x) => ({ ...x, startMin: Math.max(0, x.startMin + delta), endMin: Math.max(0, x.endMin + delta) }));
}
