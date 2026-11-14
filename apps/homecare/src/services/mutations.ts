import { getI18n } from 'react-i18next';

import { repos } from '@/database';
import { useSession } from '@/store/session';

import { recordError } from './analytics';
import { refreshHomes } from './boot';
import { syncReminders } from './reminders';

/**
 * Runs a write, then refreshes screens and re-plans reminders in the background.
 * Every screen write goes through here so notifications never drift from the data.
 */
export async function mutate<T>(write: () => Promise<T>, opts: { homes?: boolean } = {}): Promise<T> {
  const result = await write();
  const r = repos();
  if (opts.homes) await refreshHomes(r);
  useSession.getState().bump();
  const i18n = getI18n();
  if (i18n) syncReminders(r, i18n.t).catch((e) => recordError(e, 'mutate_sync'));
  return result;
}
