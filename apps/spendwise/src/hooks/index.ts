import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { repos, type Repositories } from '@/database';
import { categoryName, currentLanguage } from '@/i18n';
import { recordError } from '@/services/analytics';
import { runDailyMaintenance } from '@/services/boot';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { Category } from '@/types';
import { formatMoney, MASKED_AMOUNT } from '@/utils/money';

/**
 * Loads data from SQLite and reloads it when the screen regains focus or when any write
 * bumps `dataVersion`. Errors are recorded (without data) and exposed.
 */
export function useData<T>(loader: (r: Repositories) => Promise<T>, deps: readonly unknown[] = []): { data: T | null; error: boolean; reload: () => void } {
  const version = useSession((s) => s.dataVersion);
  const ready = useSession((s) => s.dbReady);
  const [state, setState] = useState<{ data: T | null; error: boolean }>({ data: null, error: false });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    loader(repos())
      .then((data) => alive && setState({ data, error: false }))
      .catch((e: unknown) => {
        recordError(e, 'load');
        if (alive) setState((s) => ({ data: s.data, error: true }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `loader` is re-created each render; deps are explicit
  }, [ready, version, tick, ...deps]);

  useFocusEffect(useCallback(() => setTick((n) => n + 1), []));
  const reload = useCallback(() => setTick((n) => n + 1), []);
  // Previous data stays visible while reloading (no flicker).
  return { data: state.data, error: state.error, reload };
}

/**
 * Runs a write, then refreshes every screen and dependent automation (recurring catch-up,
 * budget alerts). Returns the write's result.
 */
export async function mutate<T>(fn: (r: Repositories) => Promise<T>): Promise<T> {
  const result = await fn(repos());
  useSession.getState().bump();
  runDailyMaintenance().catch((e) => recordError(e, 'maintenance'));
  return result;
}

/** Money formatter bound to the UI language and privacy mode. */
export function useMoney() {
  const privacy = usePreferences((s) => s.privacyMode);
  useTranslation(); // re-render on language change
  const lng = currentLanguage();
  return useCallback(
    (minor: number, currency: string, opts: { signed?: boolean; compact?: boolean; reveal?: boolean } = {}) =>
      privacy && !opts.reveal ? MASKED_AMOUNT : formatMoney(minor, currency, lng, opts),
    [privacy, lng],
  );
}

export function useCategoryName() {
  const { t } = useTranslation();
  return useCallback((c: Pick<Category, 'name' | 'systemKey'> | undefined | null) => (c ? categoryName(c, t) : t('categories.uncategorized')), [t]);
}
