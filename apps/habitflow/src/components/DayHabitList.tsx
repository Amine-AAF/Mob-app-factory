import { Button, EmptyState, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import type { StreakInfo } from '@/features/statistics/streaks';
import type { DueHabit } from '@/features/tracking/progress';
import { recordError } from '@/services/analytics';
import { increment, skip, toggle } from '@/services/habitService';
import type { DayKey } from '@/types';

import { HabitCard } from './HabitCard';

/**
 * A day's habit list with quick check-in. Used by Today and by the day detail
 * (past days can be completed or corrected explicitly; nothing changes them automatically).
 */
export function DayHabitList({ day, due, streaks, onCompleted, emptyAction }: { day: DayKey; due: DueHabit[]; streaks?: Map<string, StreakInfo>; onCompleted?: (xp: number) => void; emptyAction?: boolean }) {
  const { t } = useTranslation();

  const run = useCallback(
    async (fn: () => Promise<{ xpDelta: number; newlyDone: boolean }>) => {
      try {
        const r = await fn();
        if (r.newlyDone) onCompleted?.(r.xpDelta);
      } catch (e) {
        recordError(e, 'tracking');
        Alert.alert(t('common.error'));
      }
    },
    [onCompleted, t],
  );

  const more = (d: DueHabit) => {
    const actions = [
      { label: d.log?.status === 'skipped' ? t('habit.unskip') : t('habit.skip'), run: () => run(() => skip(d.habit.id, day)) },
      { label: t('habit.addNote'), run: () => router.push({ pathname: '/day/[day]', params: { day, focus: d.habit.id } }) },
      { label: t('habit.open'), run: () => router.push({ pathname: '/habit/[id]', params: { id: d.habit.id } }) },
    ];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ options: [...actions.map((a) => a.label), t('common.cancel')], cancelButtonIndex: actions.length }, (i) => actions[i]?.run());
    } else {
      Alert.alert(d.habit.name, undefined, [...actions.map((a) => ({ text: a.label, onPress: a.run })), { text: t('common.cancel'), style: 'cancel' as const }]);
    }
  };

  if (due.length === 0) {
    return (
      <EmptyState
        icon="leaf-outline"
        title={t('today.emptyTitle')}
        message={t('today.emptyBody')}
        action={emptyAction ? <Button label={t('today.browseTemplates')} icon="albums-outline" variant="secondary" size="md" onPress={() => router.push('/templates')} /> : undefined}
      />
    );
  }

  return (
    <Stack gap={3}>
      {due.map((d) => (
        <HabitCard
          key={d.habit.id}
          due={d}
          streak={streaks?.get(d.habit.id)}
          onToggle={() => void run(() => toggle(d.habit.id, day))}
          onIncrement={(delta) => void run(() => increment(d.habit.id, day, delta))}
          onOpen={() => router.push({ pathname: '/habit/[id]', params: { id: d.habit.id } })}
          onMore={() => more(d)}
        />
      ))}
      <Text variant="caption" tone="subtle" center>
        {t('today.longPressHint')}
      </Text>
    </Stack>
  );
}
