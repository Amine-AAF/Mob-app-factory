import { partySize } from './guests';
import type { Guest, SeatingAssignment, SeatingTable } from './types';

/**
 * Seating plan logic. A guest entry occupies `partySize` seats (themself, their
 * companions and children sit together). Only guests who did not decline are
 * expected to be seated.
 */

export interface TableUsage {
  table: SeatingTable;
  guests: Guest[];
  used: number;
  free: number;
  overloaded: boolean;
}

export function seatableGuests(guests: readonly Guest[]): Guest[] {
  return guests.filter((g) => g.rsvpStatus !== 'declined');
}

export function tableUsage(tables: readonly SeatingTable[], assignments: readonly SeatingAssignment[], guests: readonly Guest[]): TableUsage[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  return [...tables]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((table) => {
      const seated = assignments
        .filter((a) => a.tableId === table.id)
        .map((a) => byId.get(a.guestId))
        .filter((g): g is Guest => !!g);
      const used = seated.reduce((n, g) => n + partySize(g), 0);
      return { table, guests: seated, used, free: Math.max(0, table.seats - used), overloaded: used > table.seats };
    });
}

export function unassignedGuests(guests: readonly Guest[], assignments: readonly SeatingAssignment[]): Guest[] {
  const seated = new Set(assignments.map((a) => a.guestId));
  return seatableGuests(guests).filter((g) => !seated.has(g.id));
}

export interface SeatingSummary {
  tables: number;
  capacity: number;
  seated: number; // people
  unseated: number; // people
  overloadedTables: number;
}

export function seatingSummary(tables: readonly SeatingTable[], assignments: readonly SeatingAssignment[], guests: readonly Guest[]): SeatingSummary {
  const usage = tableUsage(tables, assignments, guests);
  return {
    tables: tables.length,
    capacity: tables.reduce((n, t) => n + t.seats, 0),
    seated: usage.reduce((n, u) => n + u.used, 0),
    unseated: unassignedGuests(guests, assignments).reduce((n, g) => n + partySize(g), 0),
    overloadedTables: usage.filter((u) => u.overloaded).length,
  };
}

export type AssignCheck = { ok: true } | { ok: false; reason: 'full'; free: number; needed: number };

/** Whether a guest party fits at a table (ignoring the guest's current seat there). */
export function canSeat(guest: Guest, table: SeatingTable, usage: readonly TableUsage[]): AssignCheck {
  const u = usage.find((x) => x.table.id === table.id);
  const alreadyThere = u?.guests.some((g) => g.id === guest.id) ?? false;
  const used = (u?.used ?? 0) - (alreadyThere ? partySize(guest) : 0);
  const free = table.seats - used;
  const needed = partySize(guest);
  return needed <= free ? { ok: true } : { ok: false, reason: 'full', free: Math.max(0, free), needed };
}

/**
 * Greedy auto-placement: keeps each group (family) together where possible,
 * biggest groups first, filling the tables with the most free seats.
 * Returns new assignments to add; existing ones are untouched.
 */
export function autoPlace(
  tables: readonly SeatingTable[],
  assignments: readonly SeatingAssignment[],
  guests: readonly Guest[],
): { tableId: string; guestId: string }[] {
  const usage = tableUsage(tables, assignments, guests);
  const free = new Map(usage.map((u) => [u.table.id, u.table.seats - u.used]));
  const pending = unassignedGuests(guests, assignments);
  const groups = new Map<string, Guest[]>();
  for (const g of pending) {
    const key = g.groupId ?? `solo:${g.id}`;
    groups.set(key, [...(groups.get(key) ?? []), g]);
  }
  const ordered = [...groups.values()].sort((a, b) => b.reduce((n, g) => n + partySize(g), 0) - a.reduce((n, g) => n + partySize(g), 0));
  const out: { tableId: string; guestId: string }[] = [];
  for (const group of ordered) {
    const size = group.reduce((n, g) => n + partySize(g), 0);
    const whole = [...free.entries()].filter(([, f]) => f >= size).sort((a, b) => a[1] - b[1])[0];
    if (whole) {
      for (const g of group) out.push({ tableId: whole[0], guestId: g.id });
      free.set(whole[0], whole[1] - size);
      continue;
    }
    // Split the group across tables, largest free space first.
    for (const g of group) {
      const target = [...free.entries()].filter(([, f]) => f >= partySize(g)).sort((a, b) => b[1] - a[1])[0];
      if (!target) continue;
      out.push({ tableId: target[0], guestId: g.id });
      free.set(target[0], target[1] - partySize(g));
    }
  }
  return out;
}

/** Positions of seat dots around a table, on a unit square (0..1). */
export function seatPositions(shape: SeatingTable['shape'], seats: number): { x: number; y: number }[] {
  const n = Math.max(0, Math.min(seats, 40));
  if (shape === 'round' || shape === 'custom') {
    return Array.from({ length: n }, (_, i) => {
      const a = (2 * Math.PI * i) / n - Math.PI / 2;
      return { x: 0.5 + 0.45 * Math.cos(a), y: 0.5 + 0.45 * Math.sin(a) };
    });
  }
  if (shape === 'head') {
    // Head table: everyone on one side, facing the room.
    return Array.from({ length: n }, (_, i) => ({ x: (i + 0.5) / n, y: 0.85 }));
  }
  const top = Math.ceil(n / 2);
  const bottom = n - top;
  return [
    ...Array.from({ length: top }, (_, i) => ({ x: (i + 0.5) / top, y: 0.08 })),
    ...Array.from({ length: bottom }, (_, i) => ({ x: (i + 0.5) / bottom, y: 0.92 })),
  ];
}
