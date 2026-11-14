import { MULTI_SLOTS, SLOTS, UNAVAILABLE_CARE_STATUSES, type Slot } from '@/domain/catalog';
import type { Outfit, OutfitItemRef, WardrobeItem } from '@/domain/types';

/**
 * Pure helpers for the outfit builder: the selection is kept per slot (ordered ids), and
 * converted to/from the stored `OutfitItemRef[]`. An item can only be in one slot at a time.
 */
export type SlotSelection = Record<Slot, string[]>;

export function emptySelection(): SlotSelection {
  return Object.fromEntries(SLOTS.map((s) => [s, [] as string[]])) as unknown as SlotSelection;
}

export const isMultiSlot = (slot: Slot): boolean => MULTI_SLOTS.includes(slot);

/** Builds a selection from stored refs, skipping items that no longer exist and duplicates. */
export function selectionFromRefs(refs: readonly OutfitItemRef[], exists: (itemId: string) => boolean): SlotSelection {
  const sel = emptySelection();
  const seen = new Set<string>();
  for (const r of [...refs].sort((a, b) => a.position - b.position)) {
    if (!(SLOTS as readonly string[]).includes(r.slot) || seen.has(r.itemId) || !exists(r.itemId)) continue;
    if (!isMultiSlot(r.slot) && sel[r.slot].length > 0) continue;
    seen.add(r.itemId);
    sel[r.slot].push(r.itemId);
  }
  return sel;
}

/** Stored refs in slot order (main pieces first) with positions 0..n-1. */
export function refsFromSelection(sel: SlotSelection): OutfitItemRef[] {
  const refs: OutfitItemRef[] = [];
  for (const slot of SLOTS) for (const itemId of sel[slot]) refs.push({ itemId, slot, position: refs.length });
  return refs;
}

export function selectedIds(sel: SlotSelection): string[] {
  return SLOTS.flatMap((s) => sel[s]);
}

/** Replaces the content of a slot. Single slots keep one item; ids are removed from other slots. */
export function setSlot(sel: SlotSelection, slot: Slot, ids: readonly string[]): SlotSelection {
  const unique = [...new Set(ids)];
  const kept = isMultiSlot(slot) ? unique : unique.slice(-1);
  const next = emptySelection();
  for (const s of SLOTS) next[s] = s === slot ? kept : sel[s].filter((id) => !kept.includes(id));
  return next;
}

export function removeFromSlot(sel: SlotSelection, slot: Slot, itemId: string): SlotSelection {
  return { ...sel, [slot]: sel[slot].filter((id) => id !== itemId) };
}

/** Parses the `items` route param (JSON OutfitItemRef[] from a suggestion). Invalid input gives []. */
export function parseItemsParam(raw: string | string[] | undefined): OutfitItemRef[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r): r is { itemId: string; slot: Slot; position?: number } => !!r && typeof r === 'object' && typeof (r as { itemId?: unknown }).itemId === 'string' && (SLOTS as readonly string[]).includes((r as { slot?: unknown }).slot as string))
      .map((r, i) => ({ itemId: r.itemId, slot: r.slot, position: typeof r.position === 'number' ? r.position : i }));
  } catch {
    return [];
  }
}

/** First free "Look #N" number, starting after the current count. */
export function nextLookNumber(existingNames: readonly string[], makeName: (n: number) => string): number {
  const names = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  let n = existingNames.length + 1;
  while (names.has(makeName(n).trim().toLowerCase())) n++;
  return n;
}

/** Selected items that are waiting to be washed or are in the laundry. */
export function unavailableItems(ids: readonly string[], items: ReadonlyMap<string, WardrobeItem>): WardrobeItem[] {
  return ids.map((id) => items.get(id)).filter((i): i is WardrobeItem => !!i && UNAVAILABLE_CARE_STATUSES.includes(i.careStatus));
}

export function filterOutfits(outfits: readonly Outfit[], scope: 'all' | 'favorites', query: string): Outfit[] {
  const q = query.trim().toLowerCase();
  return outfits.filter((o) => (scope === 'all' || o.favorite) && (!q || o.name.toLowerCase().includes(q)));
}

