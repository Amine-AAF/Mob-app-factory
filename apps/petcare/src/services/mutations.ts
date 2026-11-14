import type { TFunction } from 'i18next';

import { repos } from '@/database';
import { useSession } from '@/store/session';

import { recordError } from './analytics';
import { syncNotifications } from './notifications';

/**
 * Runs a write, then refreshes screens and re-plans notifications.
 * Every screen goes through this helper so reminders always follow the data.
 */
export async function mutate<T>(t: TFunction, work: () => Promise<T>): Promise<T> {
  const result = await work();
  const session = useSession.getState();
  session.bump();
  try {
    session.setPetCount(await repos().pets.countActive());
  } catch (e) {
    recordError(e, 'pet_count');
  }
  syncNotifications(repos(), t).catch((e) => recordError(e, 'mutate_sync'));
  return result;
}
