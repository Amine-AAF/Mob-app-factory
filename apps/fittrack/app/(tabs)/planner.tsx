import { Badge, Button, Card, EmptyState, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { addDays, fromDayKey, startOfWeek } from '@factory/app-core';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Segmented } from '@/components/ui';
import { repos } from '@/database';
import { itemsForDay, monthGrid, sameMonth, weekDays, type PlannedItem } from '@/features/planner/plan';
import { useData } from '@/hooks';
import { fmt } from '@/i18n';
import { deleteItem, postpone, restoreItem, skipItem, startItem } from '@/services/plannerService';
import { WorkoutError } from '@/services/workoutService';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { ProgramWithDays } from '@/types';

type View3 = 'day' | 'week' | 'month';

/** Workout calendar: day / week / month views, weekly routine, move / postpone / skip, history. */
export default function Planner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const today = useSession((s) => s.today);
  const weeklyTarget = usePreferences((s) => s.weeklyTarget);
  const [view, setView] = useState<View3>('week');
  const [cursor, setCursor] = useState(today);
  const [selected, setSelected] = useState(today);

  const range = useMemo(() => {
    const grid = monthGrid(cursor);
    return { from: addDays(grid[0]![0]!, -7), to: addDays(grid[5]![6]!, 7) };
  }, [cursor]);

  const { data } = useData(
    async (r) => {
      const [entries, routine, routineStart, programs, sessions] = await Promise.all([
        r.planner.entries(range.from, range.to),
        r.planner.routine(),
        r.settings.get<string | null>('routine_start', null),
        r.programs.list({ includeArchived: true }),
        r.sessions.completed({ since: range.from }),
      ]);
      return { entries, routine, routineStart, programs, sessions };
    },
    [range.from, range.to],
  );

  const items = (day: string): PlannedItem[] => (data ? itemsForDay(day, data.entries, data.routine, data.routineStart) : []);
  const doneOn = (day: string) => (data?.sessions ?? []).filter((s) => s.day === day);
  const programName = (p: ProgramWithDays | undefined, dayId: string | null) => {
    if (!p) return t('planner.workout');
    const d = p.days.find((x) => x.id === dayId);
    return p.days.length > 1 && d ? `${p.name} · ${d.name}` : p.name;
  };
  const shift = (dir: -1 | 1) => {
    const step = view === 'day' ? 1 : view === 'week' ? 7 : 0;
    if (step) {
      const n = addDays(cursor, dir * step);
      setCursor(n);
      setSelected(view === 'day' ? n : selected);
    } else {
      const d = fromDayKey(cursor);
      d.setMonth(d.getMonth() + dir, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      setCursor(key);
    }
  };

  const title = view === 'month' ? fmt.month(fromDayKey(cursor)) : view === 'week' ? `${fmt.shortDay(fromDayKey(startOfWeek(cursor)))} – ${fmt.shortDay(fromDayKey(addDays(startOfWeek(cursor), 6)))}` : fmt.longDay(fromDayKey(cursor));
  const week = weekDays(view === 'day' ? cursor : cursor);
  const plannedThisWeek = week.reduce((a, d) => a + items(d).filter((i) => i.kind === 'workout' && i.status === 'planned').length, 0);
  const doneThisWeek = week.reduce((a, d) => a + doneOn(d).length, 0);

  const act = (item: PlannedItem) => {
    const r = repos();
    const opts: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (item.kind === 'workout' && item.status === 'planned' && item.programId) {
      opts.push({
        text: t('planner.start'),
        onPress: async () => {
          try {
            await startItem(r, item);
            router.push('/workout/active');
          } catch (e) {
            if (e instanceof WorkoutError && e.code === 'already_active') router.push('/workout/active');
            else if (e instanceof WorkoutError && e.code === 'empty') Alert.alert(t('workout.emptyTitle'), t('workout.emptyBody'));
          }
        },
      });
    }
    if (item.status === 'planned' && item.day >= today) {
      opts.push({ text: t('planner.postpone'), onPress: () => void postpone(r, item) });
      opts.push({ text: t('planner.move'), onPress: () => router.push({ pathname: '/schedule', params: { day: item.day, moveKey: item.key, moveFrom: item.day } }) });
    }
    if (item.status === 'planned') opts.push({ text: t('planner.skip'), onPress: () => void skipItem(r, item) });
    if (item.status === 'skipped' || item.status === 'moved') opts.push({ text: t('planner.restore'), onPress: () => void restoreItem(r, item) });
    if (!item.fromRoutine && item.entry) opts.push({ text: t('common.delete'), style: 'destructive', onPress: () => void deleteItem(r, item) });
    opts.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(item.kind === 'rest' ? t('planner.restDay') : programName(data?.programs.find((p) => p.id === item.programId), item.programDayId), undefined, opts);
  };

  const renderDay = (day: string) => {
    const list = items(day);
    const done = doneOn(day);
    return (
      <Stack gap={2}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="heading">{day === today ? t('home.today') : fmt.longDay(fromDayKey(day))}</Text>
          <IconButton icon="add-circle" tone="primary" label={t('planner.add')} onPress={() => router.push({ pathname: '/schedule', params: { day } })} />
        </Row>
        {done.map((s) => (
          <Card key={s.id} tone="alt" onPress={() => router.push({ pathname: '/session/[id]', params: { id: s.id } })}>
            <Row gap={2}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text variant="subheading" style={{ flex: 1 }} numberOfLines={1}>
                {s.name}
              </Text>
            </Row>
          </Card>
        ))}
        {list.map((i) => (
          <Card key={i.key} onPress={() => act(i)} accessibilityLabel={i.kind === 'rest' ? t('planner.restDay') : programName(data?.programs.find((p) => p.id === i.programId), i.programDayId)}>
            <Row gap={2}>
              <Icon name={i.kind === 'rest' ? 'bed-outline' : i.status === 'done' ? 'checkmark-circle' : 'barbell-outline'} size={20} color={i.status === 'planned' ? theme.colors.primary : theme.colors.textSubtle} />
              <Text variant="subheading" style={{ flex: 1, opacity: i.status === 'planned' || i.status === 'done' ? 1 : 0.6 }} numberOfLines={1}>
                {i.kind === 'rest' ? t('planner.restDay') : programName(data?.programs.find((p) => p.id === i.programId), i.programDayId)}
              </Text>
              {i.time ? <Badge label={i.time} tone="neutral" /> : null}
              {i.fromRoutine ? <Badge label={t('planner.routineBadge')} tone="neutral" icon="repeat" /> : null}
              {i.status !== 'planned' ? <Badge label={t(`planner.status.${i.status}`)} tone={i.status === 'done' ? 'success' : 'neutral'} /> : null}
            </Row>
            {i.status === 'moved' && i.entry?.movedTo ? (
              <Text variant="caption" tone="subtle">
                {t('planner.movedTo', { day: fmt.shortDay(fromDayKey(i.entry.movedTo)) })}
              </Text>
            ) : null}
          </Card>
        ))}
        {list.length === 0 && done.length === 0 ? <Text tone="subtle">{t('planner.nothing')}</Text> : null}
      </Stack>
    );
  };

  const dot = (day: string) => {
    const list = items(day);
    if (doneOn(day).length) return theme.colors.success;
    if (list.some((i) => i.kind === 'workout' && i.status === 'planned')) return theme.colors.primary;
    if (list.some((i) => i.kind === 'rest')) return theme.colors.textSubtle;
    return null;
  };

  return (
    <Screen testID="planner">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('tabs.planner')}
        </Text>
        <Button label={t('planner.routine')} size="md" variant="secondary" icon="repeat" onPress={() => router.push('/routine')} testID="open-routine" />
      </Row>
      <Segmented value={view} onChange={(v) => { setView(v); setCursor(selected); }} options={[{ value: 'day', label: t('planner.day') }, { value: 'week', label: t('planner.week') }, { value: 'month', label: t('planner.month') }]} />
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('planner.previous')} onPress={() => shift(-1)} />
        <Pressable onPress={() => { setCursor(today); setSelected(today); }} accessibilityRole="button" accessibilityHint={t('planner.backToToday')}>
          <Text variant="subheading">{title}</Text>
        </Pressable>
        <IconButton icon="chevron-forward" label={t('planner.next')} onPress={() => shift(1)} />
      </Row>

      {view !== 'month' ? (
        <Card tone="alt">
          <Text variant="bodySmall">{t('planner.weekSummary', { done: doneThisWeek, planned: plannedThisWeek, target: weeklyTarget })}</Text>
        </Card>
      ) : null}

      {view === 'week' ? (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {week.map((d) => {
            const c = dot(d);
            const sel = d === selected;
            return (
              <Pressable key={d} onPress={() => setSelected(d)} accessibilityRole="button" accessibilityState={{ selected: sel }} accessibilityLabel={fmt.longDay(fromDayKey(d))} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 12, backgroundColor: sel ? theme.colors.primarySoft : 'transparent', borderWidth: d === today ? 1.5 : 0, borderColor: theme.colors.primary }}>
                <Text variant="caption" tone="muted">{fmt.weekdayShort(fromDayKey(d))}</Text>
                <Text variant="subheading">{String(fromDayKey(d).getDate())}</Text>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c ?? 'transparent' }} />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {view === 'month' ? (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row' }}>
            {weekDays(cursor).map((d) => (
              <Text key={d} variant="caption" tone="subtle" center style={{ flex: 1 }}>
                {fmt.weekdayNarrow(fromDayKey(d))}
              </Text>
            ))}
          </View>
          {monthGrid(cursor).map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 4 }}>
              {row.map((d) => {
                const c = dot(d);
                const sel = d === selected;
                return (
                  <Pressable key={d} onPress={() => setSelected(d)} accessibilityRole="button" accessibilityLabel={fmt.longDay(fromDayKey(d))} style={{ flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: sel ? theme.colors.primarySoft : 'transparent', opacity: sameMonth(d, cursor) ? 1 : 0.35, borderWidth: d === today ? 1.5 : 0, borderColor: theme.colors.primary }}>
                    <Text variant="bodySmall">{String(fromDayKey(d).getDate())}</Text>
                    <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c ?? 'transparent', marginTop: 2 }} />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      ) : null}

      {data ? renderDay(view === 'day' ? cursor : selected) : null}
      {data && data.programs.length === 0 ? <EmptyState icon="calendar-outline" title={t('planner.noProgramsTitle')} message={t('planner.noProgramsBody')} /> : null}
    </Screen>
  );
}
