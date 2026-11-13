import type { Guest, GuestCategory, RsvpStatus } from './types';

/**
 * Guest list logic: headcounts, RSVP statistics, search, filters and duplicate
 * detection. Pure functions, no I/O.
 */

/** Number of people a guest entry represents (the guest + companions + children). */
export function partySize(g: Pick<Guest, 'plusOnes' | 'children'>): number {
  return 1 + Math.max(0, g.plusOnes | 0) + Math.max(0, g.children | 0);
}

export interface Headcount {
  adults: number;
  children: number;
  total: number;
}

export function headcountOf(g: Pick<Guest, 'plusOnes' | 'children' | 'isChild'>): Headcount {
  const companions = Math.max(0, g.plusOnes | 0);
  const kids = Math.max(0, g.children | 0) + (g.isChild ? 1 : 0);
  const adults = (g.isChild ? 0 : 1) + companions;
  return { adults, children: kids, total: adults + kids };
}

export function sumHeadcount(guests: readonly Pick<Guest, 'plusOnes' | 'children' | 'isChild'>[]): Headcount {
  return guests.reduce<Headcount>(
    (acc, g) => {
      const h = headcountOf(g);
      return { adults: acc.adults + h.adults, children: acc.children + h.children, total: acc.total + h.total };
    },
    { adults: 0, children: 0, total: 0 },
  );
}

/** Statuses meaning the guest was reached (an invitation went out). */
const CONTACTED: readonly RsvpStatus[] = ['invited', 'confirmed', 'declined', 'maybe', 'no_response'];
/** Statuses still waiting for an answer. */
const PENDING: readonly RsvpStatus[] = ['invited', 'no_response', 'maybe'];

export function isPending(status: RsvpStatus): boolean {
  return PENDING.includes(status);
}

export interface RsvpStats {
  entries: number;
  contacted: number;
  confirmed: number;
  declined: number;
  maybe: number;
  pending: number;
  notInvited: number;
  /** People expected: confirmed entries with their companions and children. */
  expected: Headcount;
  /** Companions (adult plus-ones + children brought) among confirmed guests. */
  companions: number;
  /** Upper bound if every "maybe" came too. */
  potential: number;
  responseRate: number; // 0..1 of contacted
}

export function rsvpStats(guests: readonly Guest[]): RsvpStats {
  const by = (s: RsvpStatus) => guests.filter((g) => g.rsvpStatus === s);
  const confirmed = by('confirmed');
  const maybe = by('maybe');
  const contacted = guests.filter((g) => CONTACTED.includes(g.rsvpStatus)).length;
  const answered = confirmed.length + by('declined').length;
  const expected = sumHeadcount(confirmed);
  return {
    entries: guests.length,
    contacted,
    confirmed: confirmed.length,
    declined: by('declined').length,
    maybe: maybe.length,
    pending: guests.filter((g) => isPending(g.rsvpStatus)).length,
    notInvited: by('not_invited').length,
    expected,
    companions: confirmed.reduce((n, g) => n + Math.max(0, g.plusOnes) + Math.max(0, g.children), 0),
    potential: expected.total + sumHeadcount(maybe).total,
    responseRate: contacted === 0 ? 0 : answered / contacted,
  };
}

/* ---------------------------------------------------------------- Search */

/** Lower-case, accent-free, collapsed whitespace. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizePhone(s: string): string {
  const digits = s.replace(/[^\d+]/g, '');
  // Compare on the last 9 digits so "+33 6 12 34 56 78" matches "06 12 34 56 78".
  const only = digits.replace(/\D/g, '');
  return only.length >= 9 ? only.slice(-9) : only;
}

export function fullName(g: Pick<Guest, 'firstName' | 'lastName'>): string {
  return `${g.firstName} ${g.lastName}`.trim();
}

export interface GuestFilter {
  query?: string;
  statuses?: readonly RsvpStatus[];
  categories?: readonly GuestCategory[];
  groupId?: string | null; // undefined = any, null = without group
  onlyWithChildren?: boolean;
  onlyWithDietary?: boolean;
}

export function filterGuests(guests: readonly Guest[], f: GuestFilter): Guest[] {
  const q = f.query ? normalizeText(f.query) : '';
  return guests.filter((g) => {
    if (f.statuses?.length && !f.statuses.includes(g.rsvpStatus)) return false;
    if (f.categories?.length && !f.categories.includes(g.category)) return false;
    if (f.groupId !== undefined && g.groupId !== f.groupId) return false;
    if (f.onlyWithChildren && g.children <= 0 && !g.isChild) return false;
    if (f.onlyWithDietary && !g.dietary.trim()) return false;
    if (q) {
      const hay = normalizeText(`${g.firstName} ${g.lastName} ${g.email} ${g.notes}`);
      // Phone search ignores formatting and the national leading 0 ("0612…" finds "+33 6 12…").
      const phone = g.phone.replace(/\D/g, '');
      const qPhone = q.replace(/\D/g, '').replace(/^0+/, '');
      if (!hay.includes(q) && !(qPhone.length >= 3 && /^[\d\s+().-]+$/.test(q) && phone.includes(qPhone))) return false;
    }
    return true;
  });
}

export function sortGuests(guests: readonly Guest[], by: 'name' | 'status' | 'recent' = 'name'): Guest[] {
  const order: Record<RsvpStatus, number> = { confirmed: 0, maybe: 1, invited: 2, no_response: 3, not_invited: 4, declined: 5 };
  return [...guests].sort((a, b) => {
    if (by === 'status' && order[a.rsvpStatus] !== order[b.rsvpStatus]) return order[a.rsvpStatus] - order[b.rsvpStatus];
    if (by === 'recent') return b.createdAt.localeCompare(a.createdAt);
    return normalizeText(`${a.lastName} ${a.firstName}`).localeCompare(normalizeText(`${b.lastName} ${b.firstName}`));
  });
}

/* ------------------------------------------------------------ Duplicates */

export type DuplicateReason = 'name' | 'email' | 'phone';

export interface DuplicateMatch {
  guestId: string;
  reason: DuplicateReason;
}

type Identity = Pick<Guest, 'firstName' | 'lastName' | 'email' | 'phone'> & { id?: string };

/** Existing guests that look like the candidate (same name, email or phone). */
export function findDuplicates(candidate: Identity, existing: readonly (Identity & { id: string })[]): DuplicateMatch[] {
  const name = normalizeText(fullName(candidate));
  const email = candidate.email.trim().toLowerCase();
  const phone = normalizePhone(candidate.phone);
  const out: DuplicateMatch[] = [];
  for (const g of existing) {
    if (candidate.id && g.id === candidate.id) continue;
    if (email && g.email.trim().toLowerCase() === email) out.push({ guestId: g.id, reason: 'email' });
    else if (phone.length >= 6 && normalizePhone(g.phone) === phone) out.push({ guestId: g.id, reason: 'phone' });
    else if (name && normalizeText(fullName(g)) === name) out.push({ guestId: g.id, reason: 'name' });
  }
  return out;
}

/** Groups of guest ids that are duplicates of each other within one list. */
export function duplicateClusters(guests: readonly (Identity & { id: string })[]): string[][] {
  const parent = new Map<string, string>(guests.map((g) => [g.id, g.id]));
  const find = (x: string): string => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r) ?? r;
    return r;
  };
  const keyOwners = new Map<string, string>();
  for (const g of guests) {
    const keys = [
      normalizeText(fullName(g)) && `n:${normalizeText(fullName(g))}`,
      g.email.trim() && `e:${g.email.trim().toLowerCase()}`,
      normalizePhone(g.phone).length >= 6 && `p:${normalizePhone(g.phone)}`,
    ].filter(Boolean) as string[];
    for (const k of keys) {
      const owner = keyOwners.get(k);
      if (owner) parent.set(find(g.id), find(owner));
      else keyOwners.set(k, g.id);
    }
  }
  const clusters = new Map<string, string[]>();
  for (const g of guests) {
    const r = find(g.id);
    clusters.set(r, [...(clusters.get(r) ?? []), g.id]);
  }
  return [...clusters.values()].filter((c) => c.length > 1);
}

/* --------------------------------------------------------------- Validation */

export function validateGuest(g: Pick<Guest, 'firstName' | 'lastName' | 'email' | 'plusOnes' | 'children'>): string[] {
  const errors: string[] = [];
  if (!g.firstName.trim() && !g.lastName.trim()) errors.push('name');
  if (g.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email.trim())) errors.push('email');
  if (!Number.isInteger(g.plusOnes) || g.plusOnes < 0 || g.plusOnes > 20) errors.push('plusOnes');
  if (!Number.isInteger(g.children) || g.children < 0 || g.children > 20) errors.push('children');
  return errors;
}
