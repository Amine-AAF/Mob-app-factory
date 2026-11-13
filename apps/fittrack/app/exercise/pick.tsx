import { Button, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LibraryBrowser } from '@/components/LibraryBrowser';
import { defaultTargets, repos } from '@/database';
import { isPremiumExercise } from '@/features/library/library';
import { useExercises } from '@/hooks';
import { addExerciseToSession, startEmpty, WorkoutError } from '@/services/workoutService';
import { useIsPremium, useSession } from '@/store/session';
import type { Exercise } from '@/types';

/**
 * Multi-select exercise picker.
 *   mode=day&dayId=…        add to a program day (Workout Builder)
 *   mode=session&sessionId=… add to the running workout
 *   mode=quick               start a quick workout with the selection
 */
export default function Picker() {
  const { mode, dayId, sessionId } = useLocalSearchParams<{ mode: 'day' | 'session' | 'quick'; dayId?: string; sessionId?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const premium = useIsPremium();
  const ex = useExercises();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (e: Exercise) => {
    if (!premium && isPremiumExercise(e) && mode !== 'session') {
      router.push({ pathname: '/paywall', params: { source: 'advanced_exercise' } });
      return;
    }
    setSelected((s) => (s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id]));
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const r = repos();
      const items = selected.map((id) => ex.byId.get(id)).filter((e): e is Exercise => !!e);
      if (mode === 'day' && dayId) {
        for (const e of items) await r.programs.addExercise(dayId, e.id, defaultTargets(e.tracking));
      } else if (mode === 'session' && sessionId) {
        for (const e of items) await addExerciseToSession(r, sessionId, e.id, e.tracking);
      } else {
        const plan = items.map((e) => {
          const d = defaultTargets(e.tracking);
          return { exerciseId: e.id, targetSets: d.sets, repsMin: d.repsMin, repsMax: d.repsMax, weightKg: null, durationSec: d.durationSec, distanceM: d.distanceM, restSec: d.restSec, notes: null };
        });
        await startEmpty(r, t('workout.quickName'), plan);
        useSession.getState().bump();
        router.replace('/workout/active');
        return;
      }
      useSession.getState().bump();
      router.back();
    } catch (e) {
      if (e instanceof WorkoutError && e.code === 'already_active') Alert.alert(t('workout.alreadyActiveTitle'), t('workout.alreadyActiveBody'), [{ text: t('common.ok'), onPress: () => router.replace('/workout/active') }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.background }} testID="picker">
      <LibraryBrowser onSelect={toggle} selectedIds={selectedSet} />
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
        <Button
          label={mode === 'quick' ? (selected.length ? t('picker.startWith', { count: selected.length }) : t('picker.startEmpty')) : t('picker.add', { count: selected.length })}
          disabled={mode !== 'quick' && selected.length === 0}
          loading={busy}
          onPress={() => void confirm()}
          testID="picker-confirm"
        />
      </View>
    </SafeAreaView>
  );
}
