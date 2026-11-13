import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { repos, type Repositories } from '@/database';
import { recordError } from '@/services/analytics';
import { refreshReminders } from '@/services/reminders';
import { useDataVersion, useSession } from '@/store/session';

/**
 * Loads data from the repositories and reloads it when the screen regains focus, when any
 * write bumps the session data version, or when `deps` change (compared by value).
 */
export function useData<T>(load: (r: Repositories) => Promise<T>, deps: readonly unknown[] = []): { data: T | undefined; loading: boolean; reload: () => void } {
  const version = useDataVersion();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const depsKey = JSON.stringify(deps);

  const run = useCallback(() => {
    const id = ++seq.current;
    loadRef
      .current(repos())
      .then((d) => {
        if (id === seq.current) setData(d);
      })
      .catch((e) => recordError(e, 'load'))
      .finally(() => {
        if (id === seq.current) setLoading(false);
      });
    // `version` and `depsKey` are the triggers for reloading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, depsKey]);

  useFocusEffect(run);
  return { data, loading, reload: run };
}

/** Wraps a write: runs it, bumps data version, and re-plans reminders. */
export function useMutation() {
  const { t } = useTranslation();
  return useCallback(
    async <T>(write: (r: Repositories) => Promise<T>, opts: { reminders?: boolean } = { reminders: true }): Promise<T> => {
      const r = repos();
      const out = await write(r);
      useSession.getState().bump();
      if (opts.reminders !== false) void refreshReminders(r, t);
      return out;
    },
    [t],
  );
}
