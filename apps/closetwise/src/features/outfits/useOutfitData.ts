import { useMemo } from 'react';

import { itemMap } from '@/components/OutfitCollage';
import { repos } from '@/database';
import type { Outfit, WardrobeItem } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';

const EMPTY_OUTFITS: Outfit[] = [];
const EMPTY_ITEMS: WardrobeItem[] = [];

/**
 * Outfits + every wardrobe item (archived included, so older outfits still render) and a
 * lookup map for collages. `activeItems` is what pickers should offer.
 */
export function useOutfitData() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [outfits, items] = await Promise.all([repos().outfits.list(), repos().wardrobe.list({ archived: 'all' })]);
    return { outfits, items };
  }, []);
  const outfits = data?.outfits ?? EMPTY_OUTFITS;
  const items = data?.items ?? EMPTY_ITEMS;
  const map = useMemo(() => itemMap(items), [items]);
  const activeItems = useMemo(() => items.filter((i) => !i.archived), [items]);
  const outfitById = useMemo(() => new Map(outfits.map((o) => [o.id, o])), [outfits]);
  return { outfits, items, activeItems, map, outfitById, loading: loading && !data, ready: !!data, error, reload };
}
