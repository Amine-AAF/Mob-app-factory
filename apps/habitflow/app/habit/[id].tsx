import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { StatisticsCard } from '@/components/charts';
import { useTargetLabel } from '@/components/HabitCard';
import { ReminderSettings } from '@/components/ReminderSettings';
import { HabitIcon, StreakBadge } from '@/components/ui';
import { repos } from '@/database';
import { describeFrequencyKey, scheduleOn } from '@/features/habits/schedule';
import { habitStats } from '@/features/statistics/stats';
import { indexLogs } from '@/features/tracking/progress';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { archiveHabit, deleteHabit, unarchiveHabit } from '@/services/habitService';

const HISTORY_DAYS = 35;

export default function HabitDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = useToday();
  const targetLabel = useTargetLabel();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data } = useAsync(async () => {
    const [habit, logs] = await Promise.all([repos().habits.get(id), repos().logs.forHabit(id)]);
    if (!habit) return null;
    const idx = indexLogs(logs);
    return { habit, logs, stats: habitStats(habit, idx, today), byDay: idx.get(id) ?? new Map() };
  }, [id, today]);

  if (data === null) {
    return (
      <Screen edges={[]}>
        <Text tone="muted">{t('habit.notFound')}</Text>
      </Screen>
    );
  }
  if (!data) return null;
  const { habit, stats, byDay } = data;
  const s = scheduleOn(habit, today < habit.startDate ? habit.startDate : today) ?? habit.schedules.at(-1);
  const freq = s ? describeFrequencyKey(s.frequency) : null;
  const archived = !!habit.archivedOn && habit.archivedOn <= today;
  const historyStart = addDays(today, -(HISTORY_DAYS - 1));
  const notes = [...byDay.values()].filter((l) => l.note).reverse().slice(0, 5);

  const confirmDelete = () =>
    Alert.alert(t('habit.deleteTitle'), t('habit.deleteBody', { name: habit.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('habit.delete'), style: 'destructive', onPress: async () => {
          await deleteHabit(habit.id, t);
          router.back();
        } },
    ]);

  const confirmArchive = () =>
    Alert.alert(t('habit.archiveTitle'), t('habit.archiveBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('habit.archive'), onPress: () => void archiveHabit(habit.id, t) },
    ]);

  return (
    <>
      <RouterStack.Screen options={{ title: habit.name }} />
      <Screen edges={[]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <HabitIcon icon={habit.icon} color={habit.color} size={56} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="heading">{habit.name}</Text>
            <Text variant="caption" tone="muted">
              {[freq ? t(freq.key, freq.params) : null, s ? targetLabel(s.tracking) : null, t(`categories.${habit.category}`)].filter(Boolean).join(' · ')}
            </Text>
            <StreakBadge count={stats.streak.current} unit={stats.streak.unit} />
          </View>
        </View>
        {habit.description ? <Text tone="muted">{habit.description}</Text> : null}
        {archived ? (
          <Card tone="alt">
            <Text variant="bodySmall">{t('habit.archivedInfo')}</Text>
          </Card>
        ) : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <StatisticsCard icon="flame-outline" label={t('habit.stats.best')} value={t(`streak.${stats.streak.unit}`, { count: stats.streak.best })} tone="warning" />
          <StatisticsCard icon="checkmark-done-outline" label={t('habit.stats.total')} value={fmt.number(stats.totalCompleted)} tone="success" />
          <StatisticsCard icon="pie-chart-outline" label={t('habit.stats.rate')} value={stats.completionRate === null ? '—' : fmt.percent(stats.completionRate)} />
          <StatisticsCard icon="calendar-outline" label={t('habit.stats.month')} value={stats.monthlyRate === null ? '—' : fmt.percent(stats.monthlyRate)} tone="accent" />
        </View>

        <Card>
          <Text variant="subheading">{t('habit.history', { count: HISTORY_DAYS })}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }} accessibilityLabel={t('habit.historyA11y')}>
            {Array.from({ length: HISTORY_DAYS }, (_, i) => {
              const day = addDays(historyStart, i);
              const log = byDay.get(day);
              const before = day < habit.startDate;
              const bg = log?.status === 'done' ? habit.color : log?.status === 'partial' ? `${habit.color}66` : log?.status === 'skipped' ? theme.colors.border : theme.colors.surfaceAlt;
              return (
                <Pressable
                  key={day}
                  disabled={before || day > today}
                  accessibilityRole="button"
                  accessibilityLabel={`${fmt.longDay(fromDayKey(day))}: ${t(`habit.state.${log?.status ?? 'none'}`)}`}
                  onPress={() => router.push({ pathname: '/day/[day]', params: { day, focus: habit.id } })}
                  style={{ width: 30, height: 30, borderRadius: 7, backgroundColor: before ? 'transparent' : bg, borderWidth: day === today ? 2 : 0, borderColor: theme.colors.text }}
                />
              );
            })}
          </View>
          <Text variant="caption" tone="subtle">
            {t('habit.historyHint')}
          </Text>
        </Card>

        {notes.length ? (
          <Stack gap={2}>
            <SectionHeader title={t('habit.notes')} />
            {notes.map((l) => (
              <Card key={l.day} tone="alt">
                <Text variant="caption" tone="muted">
                  {fmt.longDay(fromDayKey(l.day))}
                </Text>
                <Text variant="bodySmall">{l.note}</Text>
              </Card>
            ))}
          </Stack>
        ) : null}
        {habit.notes ? (
          <Card tone="alt">
            <Text variant="caption" tone="muted">
              {t('editor.notes')}
            </Text>
            <Text variant="bodySmall">{habit.notes}</Text>
          </Card>
        ) : null}

        {!archived ? (
          <Stack gap={2}>
            <SectionHeader title={t('reminders.title')} />
            <ReminderSettings habitId={habit.id} />
          </Stack>
        ) : null}

        <Stack gap={2}>
          {!archived ? <Button label={t('habit.edit')} icon="create-outline" variant="secondary" size="md" onPress={() => router.push({ pathname: '/habit/edit', params: { id: habit.id } })} testID="edit-habit" /> : null}
          {archived ? (
            <Button label={t('habit.unarchive')} icon="arrow-undo-outline" variant="secondary" size="md" onPress={() => void unarchiveHabit(habit.id, t)} />
          ) : (
            <Button label={t('habit.archive')} icon="archive-outline" variant="ghost" size="md" onPress={confirmArchive} testID="archive-habit" />
          )}
          <Button label={t('habit.delete')} icon="trash-outline" variant="danger" size="md" onPress={confirmDelete} testID="delete-habit" />
        </Stack>
      </Screen>
    </>
  );
}
