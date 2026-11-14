import { PACKING_SECTIONS, type PackingSection } from '@/domain/catalog';
import { TEMPLATE_ENTRIES, tripPhase } from '@/domain/packing';
import type { DayKey, PackingEntry, Trip } from '@/domain/types';

/** Reminder options offered in the trip editor (null = off). */
export const REMINDER_OPTIONS: readonly (number | null)[] = [null, 1, 2, 3, 7];

/** Every generic checklist key used by the trip templates (labels are stored as "tpl:<key>"). */
export const ALL_TEMPLATE_KEYS: string[] = [...new Set(Object.values(TEMPLATE_ENTRIES).flatMap((list) => list.map((e) => e.key)))].sort();

export function templateKeyOf(label: string | null | undefined): string | null {
  return label && label.startsWith('tpl:') ? label.slice(4) : null;
}

export interface GroupedTrips<T> {
  ongoing: T[];
  upcoming: T[];
  past: T[];
}

/** Ongoing and upcoming trips soonest first; past trips most recent first. */
export function groupTrips<T extends Pick<Trip, 'departureDate' | 'returnDate'>>(trips: readonly T[], today: DayKey): GroupedTrips<T> {
  const out: GroupedTrips<T> = { ongoing: [], upcoming: [], past: [] };
  for (const t of trips) out[tripPhase(t, today)].push(t);
  out.ongoing.sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  out.upcoming.sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  out.past.sort((a, b) => b.departureDate.localeCompare(a.departureDate));
  return out;
}

/** Checklist entries grouped by packing section (empty sections dropped), keeping their order. */
export function entriesBySection<E extends Pick<PackingEntry, 'section' | 'position'>>(entries: readonly E[]): { section: PackingSection; data: E[] }[] {
  return PACKING_SECTIONS.map((section) => ({
    section,
    data: entries.filter((e) => e.section === section).sort((a, b) => a.position - b.position),
  })).filter((g) => g.data.length > 0);
}
