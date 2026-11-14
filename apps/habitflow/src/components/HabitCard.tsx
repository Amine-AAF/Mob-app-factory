import { Icon, PressableScale, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { StreakInfo } from '@/features/statistics/streaks';
import type { DueHabit } from '@/features/tracking/progress';
import { fmt } from '@/i18n';
import type { Tracking } from '@/types';

import { AnimatedBar, HabitIcon, StreakBadge } from './ui';

export function useTargetLabel() {
  const { t } = useTranslation();
  return (tracking: Tracking, value?: number) => {
    if (tracking.mode === 'check') return null;
    const unit = tracking.mode === 'duration' ? t('units.min') : tracking.unit ? t(`units.${tracking.unit}`, { defaultValue: tracking.unit }) : '';
    return value === undefined ? `${fmt.number(tracking.target)} ${unit}`.trim() : `${fmt.number(value)} / ${fmt.number(tracking.target)} ${unit}`.trim();
  };
}

/**
 * One habit on a day's list: quick check-in button (or +/− for quantities),
 * streak, period progress for flexible habits. Tapping the body opens the habit.
 */
export function HabitCard({
  due,
  streak,
  readOnly,
  onToggle,
  onIncrement,
  onOpen,
  onMore,
}: {
  due: DueHabit;
  streak?: StreakInfo;
  readOnly?: boolean;
  onToggle: () => void;
  onIncrement?: (delta: number) => void;
  onOpen: () => void;
  onMore?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const targetLabel = useTargetLabel();
  const { habit, log, tracking, period } = due;
  const done = log?.status === 'done';
  const skipped = log?.status === 'skipped';
  const value = log && !skipped ? log.value : 0;
  const quantity = tracking.mode !== 'check';
  const step = tracking.mode === 'duration' ? 5 : tracking.target >= 1000 ? 500 : tracking.target >= 20 ? 5 : 1;
  const stateLabel = skipped ? t('habit.state.skipped') : done ? t('habit.state.done') : t('habit.state.pending');

  return (
    <View
      testID={`habit-${habit.id}`}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: theme.radius.lg,
        backgroundColor: done ? theme.colors.successSoft : theme.colors.surface, borderWidth: 1, borderColor: done ? 'transparent' : theme.colors.border,
        opacity: skipped ? 0.6 : 1,
      }}
    >
      <PressableScale onPress={onOpen} onLongPress={onMore} accessibilityRole="button" accessibilityLabel={`${habit.name}, ${stateLabel}`} accessibilityHint={t('habit.openHint')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <HabitIcon icon={habit.icon} color={habit.color} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="subheading" numberOfLines={1} style={done ? { textDecorationLine: 'line-through', opacity: 0.8 } : undefined}>
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {streak ? <StreakBadge count={streak.current} unit={streak.unit} compact /> : null}
            {period ? (
              <Text variant="caption" tone="muted">
                {t(`habit.periodProgress.${streak?.unit === 'month' ? 'month' : 'week'}`, { done: period.done, target: period.target })}
              </Text>
            ) : null}
            {quantity ? (
              <Text variant="caption" tone="muted">
                {targetLabel(tracking, value)}
              </Text>
            ) : null}
            {skipped ? (
              <Text variant="caption" tone="subtle">
                {t('habit.state.skipped')}
              </Text>
            ) : null}
          </View>
          {quantity && !done && value > 0 ? <AnimatedBar progress={value / tracking.target} color={habit.color} height={6} /> : null}
        </View>
      </PressableScale>

      {quantity && onIncrement && !done && !readOnly ? (
        <PressableScale onPress={() => onIncrement(step)} accessibilityRole="button" accessibilityLabel={t('habit.addAmount', { amount: fmt.number(step), name: habit.name })} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}>
          <Text variant="caption" style={{ fontWeight: '700' }}>{`+${fmt.number(step)}`}</Text>
        </PressableScale>
      ) : null}

      <PressableScale
        onPress={onToggle}
        disabled={readOnly}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done, disabled: readOnly }}
        accessibilityLabel={done ? t('habit.undo', { name: habit.name }) : t('habit.complete', { name: habit.name })}
        testID={`toggle-${habit.id}`}
        style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? theme.colors.success : 'transparent', borderWidth: done ? 0 : 2, borderColor: habit.color }}
      >
        <Icon name="checkmark" size={26} color={done ? '#FFFFFF' : habit.color} />
      </PressableScale>
    </View>
  );
}
