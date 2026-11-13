import type { PackingTemplateKey } from '@/content/packingCatalog';
import { repos } from '@/database';
import type { PackingItemInput } from '@/database/repositories/packing';
import { track } from '@/services/analytics';
import { notifyDataChanged } from '@/store/session';
import type { Id } from '@/types/models';

async function withRefresh<T>(fn: () => Promise<T>): Promise<T> {
  const r = await fn();
  notifyDataChanged();
  return r;
}

export const createPackingList = (tripId: Id, name: string) => withRefresh(() => repos().packing.createList(tripId, name));
export const createPackingFromTemplate = (tripId: Id, key: PackingTemplateKey, name: string, lang: string) => withRefresh(() => repos().packing.createFromBuiltIn(tripId, key, name, lang));
export const createPackingFromUserTemplate = (tripId: Id, templateId: Id) => withRefresh(() => repos().packing.createFromUserTemplate(tripId, templateId));
export const savePackingAsTemplate = (listId: Id, name: string) => withRefresh(() => repos().packing.saveAsTemplate(listId, name));
export const renamePackingList = (listId: Id, name: string) => withRefresh(() => repos().packing.renameList(listId, name));
export const deletePackingList = (listId: Id) => withRefresh(() => repos().packing.deleteList(listId));
export const addPackingItem = (listId: Id, input: PackingItemInput) => withRefresh(() => repos().packing.addItem(listId, input));
export const updatePackingItem = (id: Id, input: PackingItemInput) => withRefresh(() => repos().packing.updateItem(id, input));
export const deletePackingItem = (id: Id) => withRefresh(() => repos().packing.deleteItem(id));
export const resetPackingList = (listId: Id) => withRefresh(() => repos().packing.resetList(listId));

/** Toggles an item; emits `checklist_completed` once when the list becomes fully packed. */
export async function togglePacked(listId: Id, itemId: Id, packed: boolean) {
  await repos().packing.setPacked(itemId, packed);
  if (packed) {
    const list = await repos().packing.getList(listId);
    if (list && list.total > 0 && list.packed === list.total) track('checklist_completed', { kind: 'packing' });
  }
  notifyDataChanged();
}
