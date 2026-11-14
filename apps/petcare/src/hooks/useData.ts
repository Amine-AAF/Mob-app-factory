import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useEffectEvent, useState } from 'react';

import { repos, type Repositories } from '@/database';
import { recordError } from '@/services/analytics';
import { useSession } from '@/store/session';

/**
 * Loads data from the repositories and reloads it after any write (`session.bump()`)
 * and whenever the screen regains focus. `deps` must be serialisable (ids, filters).
 */
export function useData<T>(load: (r: Repositories) => Promise<T>, deps: unknown[] = []): { data: T | undefined; loading: boolean; error: boolean; reload: () => void } {
  const version = useSession((s) => s.dataVersion);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ key: string | null; data: T | undefined; error: boolean }>({ key: null, data: undefined, error: false });
  const key = `${version}:${tick}:${JSON.stringify(deps)}`;

  // Always calls the latest `load` closure without making it an effect dependency.
  const run = useEffectEvent((forKey: string, alive: () => boolean) => {
    load(repos())
      .then((data) => {
        if (alive()) setState({ key: forKey, data, error: false });
      })
      .catch((e) => {
        recordError(e, 'use_data');
        if (alive()) setState((s) => ({ ...s, key: forKey, error: true }));
      });
  });

  useEffect(() => {
    let alive = true;
    run(key, () => alive);
    return () => {
      alive = false;
    };
  }, [key]);

  useFocusEffect(useCallback(() => setTick((n) => n + 1), []));

  return { data: state.data, loading: state.key !== key, error: state.error, reload: () => setTick((n) => n + 1) };
}
