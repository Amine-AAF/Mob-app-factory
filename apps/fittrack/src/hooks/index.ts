import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';

import { repos, type Repositories } from '@/database';
import { libraryExercises, type ContentLanguage } from '@/features/library/library';
import { cmToDisplay, formatDuration, kgToDisplay, metersToDisplay, roundDisplay } from '@/features/units';
import { currentLanguage, fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useUnits } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { Exercise } from '@/types';

/**
 * Loads data from SQLite, re-running when the screen regains focus or after any write
 * (`dataVersion` bump). Keeps the previous value while reloading (no flicker).
 */
export function useData<T>(load: (r: Repositories) => Promise<T>, deps: unknown[] = []): { data: T | undefined; reload: () => void; loading: boolean } {
  const version = useSession((s) => s.dataVersion);
  const ready = useSession((s) => s.dbReady);
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);
  useFocusEffect(useCallback(() => setTick((t) => t + 1), []));
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    load(repos())
      .then((v) => !cancelled && alive.current && setData(v))
      .catch((e) => recordError(e, 'use_data'))
      .finally(() => !cancelled && alive.current && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, version, tick, ...deps]);
  return { data, loading, reload: () => setTick((t) => t + 1) };
}

/**
 * "Now", refreshed every `intervalMs` while active and immediately when the app
 * returns to the foreground (timers are recomputed from timestamps, not counted).
 */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => clock.now().getTime());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(clock.now().getTime()), intervalMs);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setNow(clock.now().getTime()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs, enabled]);
  return now;
}

/** Library + custom exercises in the interface language, indexed by id. */
export function useExercises(): { list: Exercise[]; byId: Map<string, Exercise>; get: (id: string) => Exercise | undefined } {
  const { i18n, t } = useTranslation();
  const lng = (['en', 'fr', 'es'].includes(i18n.language) ? i18n.language : 'en') as ContentLanguage;
  const { data: custom } = useData((r) => r.exercises.listCustom());
  return useMemo(() => {
    const lib = libraryExercises(lng);
    const own: Exercise[] = (custom ?? []).map((c) => ({
      id: c.id, source: 'custom', category: c.category, primary: c.primary, secondary: c.secondary, equipment: c.equipment, level: c.level,
      tracking: c.tracking, name: c.name, description: c.description ?? '', steps: [], tips: [], mistakes: [], easier: null, harder: null, easierId: null, harderId: null,
    }));
    const list = [...lib, ...own];
    const byId = new Map(list.map((e) => [e.id, e]));
    return { list, byId, get: (id: string) => byId.get(id) ?? (id ? ({ ...lib[0]!, id, name: t('exercise.unknown'), source: 'custom' } as Exercise) : undefined) };
  }, [lng, custom, t]);
}

/** Unit-aware formatters bound to the user's preferences. */
export function useFormat() {
  const units = useUnits();
  const { t } = useTranslation();
  return useMemo(
    () => ({
      units,
      weight: (kg: number | null | undefined) => (kg === null || kg === undefined ? '—' : `${fmt.number(roundDisplay(kgToDisplay(kg, units.weight), 1))} ${t(`units.${units.weight}`)}`),
      weightValue: (kg: number) => roundDisplay(kgToDisplay(kg, units.weight), 1),
      distance: (m: number | null | undefined) => (m === null || m === undefined ? '—' : `${fmt.number(roundDisplay(metersToDisplay(m, units.distance), 2), 2)} ${t(`units.${units.distance}`)}`),
      length: (cm: number | null | undefined) => (cm === null || cm === undefined ? '—' : `${fmt.number(roundDisplay(cmToDisplay(cm, units.length), 1))} ${t(`units.${units.length}`)}`),
      duration: (sec: number | null | undefined) => (sec === null || sec === undefined ? '—' : formatDuration(sec)),
      minutes: (min: number) => t('units.minutesShort', { count: Math.round(min) }),
      pace: (secPerUnit: number | null) => (secPerUnit === null ? '—' : `${formatDuration(secPerUnit)} /${t(`units.${units.distance}`)}`),
      speed: (kmh: number | null) =>
        kmh === null ? '—' : units.distance === 'km' ? `${fmt.number(roundDisplay(kmh, 1))} ${t('units.kmh')}` : `${fmt.number(roundDisplay(kmh / 1.609344, 1))} ${t('units.mph')}`,
    }),
    [units, t],
  );
}

export { currentLanguage };
