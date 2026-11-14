import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';

import { createFormatter, type Formatter } from '@/features/format/format';
import { currentLanguage } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/**
 * Runs an async loader; re-runs when deps or the global dataVersion change.
 * Stale results are ignored; previous data stays visible while reloading.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]): { data: T | undefined; loading: boolean; error: Error | null; reload: () => void } {
  const dataVersion = useSession((s) => s.dataVersion);
  const dbReady = useSession((s) => s.dbReady);
  const [nonce, setNonce] = useState(0);
  const key = JSON.stringify([dataVersion, nonce, ...deps]);
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
  }, [dbReady, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data: result.data, loading: result.key !== key, error: result.error, reload };
}

/** Current local day; refreshed when the app returns to the foreground. */
export function useToday(): string {
  const today = useSession((s) => s.today);
  useEffect(() => {
    const refresh = () => useSession.getState().setToday(clock.today());
    refresh();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => sub.remove();
  }, []);
  return today || clock.today();
}

/** Formatter bound to the interface language and the user's units. */
export function useFormat(): Formatter {
  const { i18n } = useTranslation();
  const units = usePreferences((s) => s.units);
  const lng = i18n?.language ?? currentLanguage();
  return useMemo(() => createFormatter(lng, units), [lng, units]);
}
