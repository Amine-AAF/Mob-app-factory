import { addDays, fromDayKey, startOfWeek } from '@factory/app-core';
import { Card, IconButton, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CalendarLegend, MonthCalendar, WeeklyCalendar, type CalendarDay } from '@/components/calendar';
import { HabitIcon, Segmented } from '@/components/ui';
import { loadSnapshot, repos } from '@/database';
import { daysBetween, endOfMonth, startOfMonth } from '@/features/habits/schedule';
import { habitsForDay, indexLogs, summarizeDay } from '@/features/tracking/progress';
import { useAsync, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';

/** Month / week views of real completion states. No ads on this screen (policy). */
export default function CalendarScreen() {
  const { t } = useTranslation();
  const today = useToday();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState<string>(today);

  useEffect(() => track('calendar_opened', { view }), [view]);

  const range = useMemo(() => (view === 'month' ? { from: startOfMonth(anchor), to: endOfMonth(anchor) } : { from: startOfWeek(anchor), to: addDays(startOfWeek(anchor), 6) }), [anchor, view]);

  const { data } = useAsync(async () => {
    const snapshot = await loadSnapshot(repos().db);
    const idx = indexLogs(snapshot.logs);
    const days = new Map<string, CalendarDay>();
    for (const d of daysBetween(range.from, range.to)) {
      const s = summarizeDay(snapshot, d, today, idx);
      days.set(d, { day: d, state: s.state, ratio: s.ratio });
    }
    const detail = habitsForDay(snapshot, selected, idx);
    const sel = summarizeDay(snapshot, selected, today, idx);
    return { days, detail, sel };
  }, [range.from, range.to, selected, today]);

  const shift = (dir: -1 | 1) => {
    if (view === 'week') return setAnchor(addDays(anchor, dir * 7));
    const d = fromDayKey(startOfMonth(anchor));
    const next = new Date(d.getFullYear(), d.getMonth() + dir, 1);
    setAnchor(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`);
  };
  const canGoNext = range.to < today;
  const title = view === 'month' ? fmt.month(fromDayKey(range.from)) : `${fmt.shortDay(fromDayKey(range.from))} – ${fmt.shortDay(fromDayKey(range.to))}`;

  return (
    <Screen testID="calendar-screen">
      <Text variant="title">{t('calendar.title')}</Text>
      <Segmented value={view} onChange={setView} options={[{ value: 'month', label: t('calendar.month') }, { value: 'week', label: t('calendar.week') }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('calendar.previous')} onPress={() => shift(-1)} />
        <Text variant="heading" style={{ textTransform: 'capitalize' }}>
          {title}
        </Text>
        {canGoNext ? <IconButton icon="chevron-forward" label={t('calendar.next')} onPress={() => shift(1)} /> : <View style={{ width: 40 }} />}
      </View>
      <Card>
        {data ? (
          view === 'month' ? (
            <MonthCalendar month={range.from} days={data.days} today={today} selected={selected} onSelect={setSelected} />
          ) : (
            <WeeklyCalendar days={[...data.days.values()]} selected={selected} today={today} onSelect={setSelected} />
          )
        ) : null}
        <CalendarLegend />
      </Card>

      {data ? (
        <Card onPress={() => router.push({ pathname: '/day/[day]', params: { day: selected } })} testID="day-detail-card">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="subheading" style={{ textTransform: 'capitalize' }}>
              {fmt.longDay(fromDayKey(selected))}
            </Text>
            <Text variant="subheading" tone="primary">
              {data.sel.expected ? `${data.sel.completed}/${data.sel.expected}` : '—'}
            </Text>
          </View>
          <Text variant="caption" tone="muted">
            {t(`calendar.state.${data.sel.state}`)}
          </Text>
          <Stack gap={2}>
            {data.detail.map((d) => (
              <View key={d.habit.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <HabitIcon icon={d.habit.icon} color={d.habit.color} size={26} />
                <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                  {d.habit.name}
                </Text>
                <Text variant="caption" tone={d.log?.status === 'done' ? 'success' : 'subtle'}>
                  {t(`habit.state.${d.log?.status === 'done' ? 'done' : d.log?.status === 'skipped' ? 'skipped' : d.log?.status === 'partial' ? 'partial' : selected < today ? 'missed' : 'pending'}`)}
                </Text>
              </View>
            ))}
          </Stack>
          <Text variant="caption" tone="primary">
            {t('calendar.openDay')}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
