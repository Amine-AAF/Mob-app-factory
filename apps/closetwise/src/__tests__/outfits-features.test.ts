import { canMarkWorn, coverItemId, groupByDate, isValidDayKey, withinFreeHistory } from '@/features/calendar/calendarLogic';
import { emptySelection, filterOutfits, nextLookNumber, parseItemsParam, refsFromSelection, removeFromSlot, selectionFromRefs, setSlot, unavailableItems } from '@/features/outfits/builderLogic';
import type { Outfit, OutfitSchedule, WardrobeItem } from '@/domain/types';

const item = (id: string, patch: Partial<WardrobeItem> = {}) => ({ id, name: id, careStatus: 'clean', ...patch }) as WardrobeItem;
const outfit = (id: string, patch: Partial<Outfit> = {}) => ({ id, name: id, favorite: false, items: [], ...patch }) as unknown as Outfit;

describe('outfit builder selection', () => {
  it('builds a selection from refs, skipping deleted items, duplicates and extra single-slot items', () => {
    const exists = (id: string) => id !== 'gone';
    const sel = selectionFromRefs(
      [
        { itemId: 'top1', slot: 'top', position: 0 },
        { itemId: 'top2', slot: 'top', position: 1 },
        { itemId: 'gone', slot: 'bottom', position: 2 },
        { itemId: 'a1', slot: 'accessory', position: 3 },
        { itemId: 'a2', slot: 'accessory', position: 4 },
        { itemId: 'a1', slot: 'extra', position: 5 },
      ],
      exists,
    );
    expect(sel.top).toEqual(['top1']);
    expect(sel.bottom).toEqual([]);
    expect(sel.accessory).toEqual(['a1', 'a2']);
    expect(sel.extra).toEqual([]);
  });

  it('converts back to refs in slot order with fresh positions', () => {
    let sel = emptySelection();
    sel = setSlot(sel, 'shoes', ['s1']);
    sel = setSlot(sel, 'top', ['t1']);
    expect(refsFromSelection(sel)).toEqual([
      { itemId: 't1', slot: 'top', position: 0 },
      { itemId: 's1', slot: 'shoes', position: 1 },
    ]);
  });

  it('keeps one item in single slots and moves an item out of its previous slot', () => {
    let sel = setSlot(emptySelection(), 'extra', ['x', 'y']);
    sel = setSlot(sel, 'top', ['a', 'x']);
    expect(sel.top).toEqual(['x']);
    expect(sel.extra).toEqual(['y']);
    expect(removeFromSlot(sel, 'extra', 'y').extra).toEqual([]);
  });

  it('parses the items param defensively', () => {
    expect(parseItemsParam(undefined)).toEqual([]);
    expect(parseItemsParam('not json')).toEqual([]);
    expect(parseItemsParam('{"a":1}')).toEqual([]);
    expect(parseItemsParam(JSON.stringify([{ itemId: 'a', slot: 'top', position: 0 }, { itemId: 'b', slot: 'nope' }, { slot: 'shoes' }]))).toEqual([{ itemId: 'a', slot: 'top', position: 0 }]);
  });

  it('suggests the first free look number', () => {
    const make = (n: number) => `Look #${n}`;
    expect(nextLookNumber([], make)).toBe(1);
    expect(nextLookNumber(['Look #2', 'Office'], make)).toBe(3);
    expect(nextLookNumber(['Look #2', 'look #3'], make)).toBe(4);
  });

  it('flags selected items that are waiting to be washed or in the laundry', () => {
    const map = new Map([item('a', { careStatus: 'to_wash' }), item('b'), item('c', { careStatus: 'in_laundry' })].map((i) => [i.id, i]));
    expect(unavailableItems(['a', 'b', 'c', 'missing'], map).map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('filters outfits by favorites and name', () => {
    const list = [outfit('Office look', { favorite: true }), outfit('Weekend')];
    expect(filterOutfits(list, 'favorites', '').map((o) => o.id)).toEqual(['Office look']);
    expect(filterOutfits(list, 'all', 'week').map((o) => o.id)).toEqual(['Weekend']);
  });
});

describe('calendar helpers', () => {
  const plan = (id: string, date: string) => ({ id, date }) as OutfitSchedule;

  it('groups plans by date keeping order', () => {
    const g = groupByDate([plan('1', '2026-11-13'), plan('2', '2026-11-14'), plan('3', '2026-11-13')]);
    expect(g.get('2026-11-13')!.map((p) => p.id)).toEqual(['1', '3']);
    expect(g.get('2026-11-14')!.length).toBe(1);
  });

  it('allows marking as worn only today or in the past', () => {
    expect(canMarkWorn('2026-11-13', '2026-11-13')).toBe(true);
    expect(canMarkWorn('2026-11-01', '2026-11-13')).toBe(true);
    expect(canMarkWorn('2026-11-14', '2026-11-13')).toBe(false);
  });

  it('keeps 14 days in the free history window', () => {
    expect(withinFreeHistory('2026-11-13', '2026-11-13')).toBe(true);
    expect(withinFreeHistory('2026-10-31', '2026-11-13')).toBe(true);
    expect(withinFreeHistory('2026-10-30', '2026-11-13')).toBe(false);
  });

  it('validates day keys', () => {
    expect(isValidDayKey('2026-11-13')).toBe(true);
    expect(isValidDayKey('2026-1-3')).toBe(false);
    expect(isValidDayKey(undefined)).toBe(false);
  });

  it('picks a representative cover item', () => {
    const refs = [
      { itemId: 'shoe', slot: 'shoes', position: 0 },
      { itemId: 'gone', slot: 'top', position: 1 },
      { itemId: 'pants', slot: 'bottom', position: 2 },
    ] as const;
    expect(coverItemId(refs, (id) => id !== 'gone')).toBe('pants');
    expect(coverItemId([], () => true)).toBeNull();
  });
});
