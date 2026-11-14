import { useCallback, useState } from 'react';

import { repos, type EventSnapshot, type Repositories } from '@/database';
import { i18nInstance } from '@/i18n';
import { recordError } from '@/services/analytics';
import { syncNotifications } from '@/services/notifications';
import { dataChanged } from '@/store/session';

import { useAsync } from './useAsync';

let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Re-plans reminders shortly after a burst of writes. */
function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const i18n = i18nInstance();
    if (i18n) syncNotifications(repos(), i18n.t).catch((e) => recordError(e, 'sync'));
  }, 800);
}

/** Runs a write, then refreshes every screen and the scheduled reminders. */
export async function mutate<T>(fn: (r: Repositories) => Promise<T>): Promise<T> {
  const result = await fn(repos());
  dataChanged();
  scheduleSync();
  return result;
}

/** Same as `mutate` with a busy flag and error capture for buttons. */
export function useMutation() {
  const [busy, setBusy] = useState(false);
  const run = useCallback(async <T,>(fn: (r: Repositories) => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try {
      return await mutate(fn);
    } catch (e) {
      recordError(e, 'mutation');
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);
  return { busy, run };
}

export function useSnapshot(eventId: string | undefined) {
  return useAsync<EventSnapshot | null>(() => (eventId ? repos().snapshot(eventId) : Promise.resolve(null)), [eventId]);
}

export function useRepo<T>(loader: (r: Repositories) => Promise<T>, deps: unknown[]) {
  return useAsync<T>(() => loader(repos()), deps);
}
