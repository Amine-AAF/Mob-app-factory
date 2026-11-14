import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSession } from '@/store/session';

import { recordError } from '@/services/analytics';

/**
 * Loads screen data from SQLite, reloading when the screen regains focus and after
 * any write (session.dataVersion). Keeps the previous value while reloading so lists
 * don't flash.
 */
export function useData<T>(load: () => Promise<T>, deps: readonly unknown[] = []): { data: T | undefined; loading: boolean; error: boolean; reload: () => void } {
  const version = useSession((s) => s.dataVersion);
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Stable string key so the dependency list stays an array literal.
  const key = JSON.stringify([version, ...deps]);
  const run = useCallback(() => {
    setLoading(true);
    loadRef
      .current()
      .then((v) => {
        if (mounted.current) {
          setData(v);
          setError(false);
        }
      })
      .catch((e) => {
        recordError(e, 'screen_load');
        if (mounted.current) setError(true);
      })
      .finally(() => mounted.current && setLoading(false));
    // `key` encodes the caller deps + dataVersion; the loader itself is read from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useFocusEffect(run);
  return { data, loading, error, reload: run };
}
