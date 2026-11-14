import { EmptyState, Icon, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { repos } from '@/database';
import { completionRate } from '@/features/planner/planner';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

export default function PlannerHistory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useAsync(async () => ({ sessions: await repos().planner.history(200), focus: await repos().planner.focusHistory(30) }), []);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  const rate = completionRate(data.sessions, clock.now());

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('planner.history') }} />
      {rate != null ? (
        <Text tone="muted">
          {t('planner.completionRate', { value: fmt.percent(rate) })}
        </Text>
      ) : null}
      {data.sessions.length === 0 && data.focus.length === 0 ? <EmptyState icon="time-outline" title={t('planner.noHistory')} /> : null}
      {data.sessions.map((s) => (
        <Pressable key={s.id} onPress={() => router.push({ pathname: '/planner/session', params: { id: s.id } })} accessibilityRole="button">
          <Row gap={3} style={{ paddingVertical: 6 }}>
            <Icon
              name={s.status === 'done' ? 'checkmark-circle' : s.status === 'skipped' ? 'remove-circle-outline' : 'alert-circle-outline'}
              size={22}
              color={s.status === 'done' ? theme.colors.success : s.status === 'skipped' ? theme.colors.textSubtle : theme.colors.warning}
            />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1}>{s.title}</Text>
              <Text variant="caption" tone="subtle">
                {fmt.day(s.day)} · {fmt.duration(s.actualMinutes ?? s.durationMin)} · {t(`planner.status.${s.status === 'planned' ? 'missed' : s.status}`)}
              </Text>
            </View>
          </Row>
        </Pressable>
      ))}
      {data.focus.length ? (
        <>
          <Text variant="heading" accessibilityRole="header">
            {t('focus.history')}
          </Text>
          {data.focus.map((f) => (
            <Row key={f.id} gap={3} style={{ paddingVertical: 4 }}>
              <Icon name="timer-outline" size={20} color={theme.colors.primary} />
              <Text style={{ flex: 1 }}>{fmt.dateTime(f.startedAt)}</Text>
              <Text variant="bodySmall" tone="muted">
                {fmt.duration(f.focusMinutes)} · {t('focus.cyclesCount', { count: f.cycles })}
              </Text>
            </Row>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
