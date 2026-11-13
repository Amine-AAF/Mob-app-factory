import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/store/session';

/**
 * Runs an async loader and re-runs it when deps or the global dataVersion change.
 * Results from stale runs are ignored (no setState after unmount / out of order).
 * `loading` is derived from whether the latest result matches the current request key.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): { data: T | undefined; loading: boolean; error: Error | null; reload: () => void } {
  const dataVersion = useSession((s) => s.dataVersion);
  const dbReady = useSession((s) => s.dbReady);
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([dataVersion, nonce, ...deps.map((d) => (typeof d === 'object' && d !== null ? Object.keys(d).length : d))]);
  const [result, setResult] = useState<{ key: string; data: T | undefined; error: Error | null }>({ key: '', data: undefined, error: null });

  useEffect(() => {
    if (!dbReady) return;
    let cancelled = false;
    loader()
      .then((data) => !cancelled && setResult({ key, data, error: null }))
      .catch((e: unknown) => !cancelled && setResult((r) => ({ key, data: r.data, error: e instanceof Error ? e : new Error(String(e)) })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `loader` is re-created each render; deps are explicit
  }, [dbReady, dataVersion, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  // Keep showing previous data while reloading (no flicker).
  return { data: result.data, loading: result.key !== key, error: result.error, reload };
}
