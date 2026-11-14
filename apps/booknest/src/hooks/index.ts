import { BackupError } from '@factory/storage';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { LimitReachedError, type PremiumFeature } from '@/config/limits';
import { repos, type Repositories } from '@/database';
import { SessionError } from '@/features/sessions/timer';
import { ProgressError } from '@/features/tracking/progress';
import { CsvError } from '@/features/transfer/csv';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { ContentValidationError } from '@/services/contentService';
import { GoalValidationError } from '@/services/goalService';
import { BookValidationError } from '@/services/libraryService';
import { useIsPremium, useSession } from '@/store/session';

/**
 * Loads data from SQLite and reloads it after every write (`dataVersion`) or when
 * `deps` change. Keeps the previous value while reloading, so lists never flash.
 */
export function useData<T>(loader: (r: Repositories) => Promise<T>, deps: unknown[] = []): { data: T | undefined; loading: boolean; reload: () => void } {
  const version = useSession((s) => s.dataVersion);
  const ready = useSession((s) => s.dbReady);
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });
  // Flag the reload as soon as an input changes (derived during render, not set from the effect).
  const inputs = [ready, version, tick, ...deps];
  const [loadedInputs, setLoadedInputs] = useState(inputs);
  if (inputs.length !== loadedInputs.length || inputs.some((v, i) => !Object.is(v, loadedInputs[i]))) {
    setLoadedInputs(inputs);
    setLoading(true);
  }
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    loaderRef
      .current(repos())
      .then((d) => alive && setData(d))
      .catch((e) => recordError(e, 'use_data'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, version, tick, ...deps]);
  return { data, loading, reload: useCallback(() => setTick((x) => x + 1), []) };
}

/** Current local day, refreshed when the app returns to the foreground. */
export function useToday(): string {
  const today = useSession((s) => s.today) || clock.today();
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && useSession.getState().setToday(clock.today()));
    return () => sub.remove();
  }, []);
  return today;
}

/** A "now" that re-renders every `intervalMs` while mounted (used by the live timer display). */
export function useNow(intervalMs = 1000, active = true): Date {
  const [now, setNow] = useState(() => clock.now());
  // Catch up immediately when the ticker is (re)activated (derived during render).
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (active) setNow(clock.now());
  }
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(clock.now()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setNow(clock.now()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs, active]);
  return now;
}

/** Maps domain errors to user-facing, translated messages (never raw technical text). */
export function errorMessage(e: unknown, t: TFunction): string {
  if (e instanceof LimitReachedError) return t(`limits.${e.kind}`, { count: e.limit });
  if (e instanceof BookValidationError) return t(`errors.book.${e.field}`);
  if (e instanceof ProgressError) return t(`errors.progress.${e.code}`);
  if (e instanceof SessionError) return t(`errors.session.${e.code}`);
  if (e instanceof GoalValidationError) return t(`errors.goal.${e.code}`);
  if (e instanceof ContentValidationError) return t(`errors.content.${e.code}`);
  if (e instanceof CsvError) return t(`errors.csv.${e.code}`);
  if (e instanceof BackupError) return t(`errors.backup.${e.code}`);
  if (e instanceof Error && e.message === 'file_too_large') return t('errors.fileTooLarge');
  recordError(e, 'ui_action');
  return t('errors.generic');
}

/** Runs an action and shows a friendly alert on failure; limits offer the paywall. */
export function useAction(t: TFunction) {
  return useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (e) {
        if (e instanceof LimitReachedError || (e instanceof GoalValidationError && e.code === 'premium_required')) {
          Alert.alert(t('limits.title'), errorMessage(e, t), [
            { text: t('common.notNow'), style: 'cancel' },
            { text: t('premium.discover'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'limit' } }) },
          ]);
        } else {
          Alert.alert(t('errors.title'), errorMessage(e, t));
        }
        return undefined;
      }
    },
    [t],
  );
}

/** Premium gate: returns true if allowed, otherwise opens the paywall. */
export function usePremiumGate() {
  const premium = useIsPremium();
  return useCallback(
    (feature: PremiumFeature) => {
      if (premium) return true;
      router.push({ pathname: '/paywall', params: { source: feature } });
      return false;
    },
    [premium],
  );
}
