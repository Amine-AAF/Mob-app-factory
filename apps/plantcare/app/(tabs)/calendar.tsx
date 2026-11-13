import { Card, Chip, EmptyState, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { addDays } from '@factory/app-core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { TaskRow } from '@/components/care';
import { TASK_ICON } from '@/components/icons';
import { MonthCalendar } from '@/components/MonthCalendar';
import { compareTasks, dueStatus, monthGrid, occurrencesBetween, weekDays } from '@/domain/schedule';
import type { CareTask, DayKey } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

type Mode = 'today' | 'week' | 'month' | 'done';

export default function Calendar() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = clock.today();
  const [mode, setMode] = useState<Mode>('today');
  const [selected, setSelected] = useState<DayKey>(today);
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));

  const { data } = useData(async (r) => {
    const [plants, tasks, history, waterings] = await Promise.all([
      r.plants.list(),
      r.tasks.listActive(),
      r.history.between(addDays(today, -30), today),
      r.watering.between(addDays(today, -30), today),
    ]);
    return { plants, tasks, history, waterings };
  });

  const byId = useMemo(() => new Map((data?.plants ?? []).map((p) => [p.id, p])), [data]);
  const tasks = useMemo(() => data?.tasks ?? [], [data]);

  // Planned occurrences for the visible month (recurring tasks projected forward).
  const marks = useMemo(() => {
    const grid = monthGrid(ym.y, ym.m);
    const out: Record<DayKey, { count: number; overdue?: boolean }> = {};
    for (const task of tasks) {
      const s = dueStatus(task, today);
      if (s === 'overdue') {
        out[today] = { count: (out[today]?.count ?? 0) + 1, overdue: true };
        continue;
      }
      for (const d of occurrencesBetween(task, grid[0]!, grid[41]!)) out[d] = { count: (out[d]?.count ?? 0) + 1, overdue: out[d]?.overdue };
    }
    return out;
  }, [tasks, ym, today]);

  const tasksOn = (day: DayKey): CareTask[] =>
    tasks.filter((task) => (dueStatus(task, today) === 'overdue' ? day === today : occurrencesBetween(task, day, day).length > 0)).sort(compareTasks);

  const overdue = tasks.filter((task) => dueStatus(task, today) === 'overdue').sort(compareTasks);
  const todayTasks = tasks.filter((task) => task.nextDue === today).sort(compareTasks);
  const week = weekDays(selected);

  const done = useMemo(() => {
    const items = [
      ...(data?.waterings ?? []).map((w) => ({ id: w.id, plantId: w.plantId, type: 'watering' as const, date: w.date, action: 'done' as const })),
      ...(data?.history ?? []).map((h) => ({ id: h.id, plantId: h.plantId, type: h.type, date: h.date, action: h.action })),
    ];
    return items.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data]);

  const plannedFor = (day: DayKey) => (day === selected ? tasksOn(day) : []);

  return (
    <Screen testID="calendar-screen">
      <Text variant="title" accessibilityRole="header">
        {t('calendar.title')}
      </Text>
      <Row wrap gap={2}>
        {(['today', 'week', 'month', 'done'] as Mode[]).map((m) => (
          <Chip key={m} label={t(`calendar.modes.${m}`)} selected={mode === m} onPress={() => setMode(m)} />
        ))}
      </Row>

      {mode === 'today' ? (
        <>
          {overdue.length > 0 ? (
            <>
              <SectionHeader title={t('calendar.overdue', { count: overdue.length })} />
              <Stack gap={2}>
                {overdue.map((task) => (
                  <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
                ))}
              </Stack>
            </>
          ) : null}
          <SectionHeader title={t('calendar.today')} />
          {todayTasks.length === 0 ? (
            <EmptyState icon="sunny-outline" title={t('calendar.nothingToday')} message={overdue.length ? undefined : t('calendar.nothingTodayBody')} />
          ) : (
            <Stack gap={2}>
              {todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
              ))}
            </Stack>
          )}
        </>
      ) : null}

      {mode === 'week' ? (
        <>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={() => setSelected(addDays(selected, -7))} accessibilityRole="button" accessibilityLabel={t('calendar.previousWeek')} hitSlop={10}>
              <Icon name="chevron-back" size={22} color={theme.colors.text} />
            </Pressable>
            <Text variant="subheading">{`${fmt.shortDay(week[0]!)} – ${fmt.shortDay(week[6]!)}`}</Text>
            <Pressable onPress={() => setSelected(addDays(selected, 7))} accessibilityRole="button" accessibilityLabel={t('calendar.nextWeek')} hitSlop={10}>
              <Icon name="chevron-forward" size={22} color={theme.colors.text} />
            </Pressable>
          </Row>
          <Stack gap={2}>
            {week.map((day) => {
              const list = tasksOn(day);
              return (
                <Card key={day} tone={day === today ? 'primary' : 'default'}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text variant="subheading" style={{ textTransform: 'capitalize' }}>
                      {fmt.day(day, { weekday: 'long', day: 'numeric', month: 'short' })}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {t('calendar.tasksCount', { count: list.length })}
                    </Text>
                  </Row>
                  {list.map((task) => {
                    const p = byId.get(task.plantId);
                    return (
                      <Row key={task.id} gap={2}>
                        <Icon name={TASK_ICON[task.type]} size={16} color={theme.colors.accent} />
                        <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                          {`${p?.nickname ?? ''} · ${t(`taskTypes.${task.type}`)}`}
                        </Text>
                      </Row>
                    );
                  })}
                </Card>
              );
            })}
          </Stack>
        </>
      ) : null}

      {mode === 'month' ? (
        <>
          <Card>
            <MonthCalendar initial={selected} selected={selected} marks={marks} onSelect={setSelected} onMonthChange={(y, m) => setYm({ y, m })} />
          </Card>
          <SectionHeader title={fmt.day(selected, { weekday: 'long', day: 'numeric', month: 'long' })} />
          {plannedFor(selected).length === 0 ? (
            <Text tone="muted">{t('calendar.nothingPlanned')}</Text>
          ) : (
            <Stack gap={2}>
              {plannedFor(selected).map((task) =>
                selected === today || dueStatus(task, today) === 'overdue' ? (
                  <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
                ) : (
                  <Row key={task.id} gap={2}>
                    <Icon name={TASK_ICON[task.type]} size={18} color={theme.colors.accent} />
                    <Text style={{ flex: 1 }}>{`${byId.get(task.plantId)?.nickname ?? ''} · ${t(`taskTypes.${task.type}`)}`}</Text>
                  </Row>
                ),
              )}
              <Text variant="caption" tone="subtle">
                {t('calendar.projectionNote')}
              </Text>
            </Stack>
          )}
        </>
      ) : null}

      {mode === 'done' ? (
        done.length === 0 ? (
          <EmptyState icon="checkmark-done-outline" title={t('calendar.noHistory')} />
        ) : (
          <Stack gap={2}>
            {done.map((h) => (
              <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <Icon name={h.action === 'done' ? 'checkmark-circle' : h.action === 'skipped' ? 'play-skip-forward-circle-outline' : 'time-outline'} size={20} color={h.action === 'done' ? theme.colors.success : theme.colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text>{`${byId.get(h.plantId)?.nickname ?? t('plants.deleted')} · ${t(`taskTypes.${h.type}`)}`}</Text>
                  <Text variant="caption" tone="muted">{`${t(`history.actions.${h.action}`)} · ${fmt.day(h.date)}`}</Text>
                </View>
              </View>
            ))}
          </Stack>
        )
      ) : null}
    </Screen>
  );
}
