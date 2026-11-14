import { addDays } from '@factory/app-core';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { monthGrid, monthKeyOf, shiftMonth, weekDays } from '@/domain/planner';
import type { DayKey, OutfitSchedule } from '@/domain/types';
import { canMarkWorn, coverItemId, groupByDate } from '@/features/calendar/calendarLogic';
import { DayCell } from '@/features/calendar/DayCell';
import { deletePlan, togglePlanWorn } from '@/features/calendar/planActions';
import { PlanCard } from '@/features/calendar/PlanCard';
import { openPaywall } from '@/features/outfits/limits';
import { useOutfitData } from '@/features/outfits/useOutfitData';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { useIsPremium } from '@/store/session';
import { Badge, Button, Card, EmptyState, IconButton, ListRow, PageHeader, PressableScale, Row, Screen, Segmented, Stack, Text, useTheme } from '@/ui';

type Mode = 'day' | 'week' | 'month';

const EMPTY: OutfitSchedule[] = [];

/** Outfit Planner. No ads (planning flow). */
export default function CalendarScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const today = clock.today();
  const [mode, setMode] = useState<Mode>('week');
  const [selected, setSelected] = useState<DayKey>(today);
  const monthKey = monthKeyOf(selected);
  const grid = useMemo(() => monthGrid(monthKey), [monthKey]);
  const week = useMemo(() => weekDays(selected), [selected]);
  // The month grid always contains the selected week, so one range query covers every mode.
  const from = grid[0]!.day < week[0]! ? grid[0]!.day : week[0]!;
  const to = grid[41]!.day > week[6]! ? grid[41]!.day : week[6]!;
  const { data: schedules = EMPTY } = useAsync(() => repos().schedules.range(from, to), [from, to]);
  const byDate = useMemo(() => groupByDate(schedules), [schedules]);
  const { outfitById, map } = useOutfitData();

  const openDay = useCallback((day: DayKey) => router.push({ pathname: '/plan/[date]', params: { date: day } }), []);

  const duplicateWeek = () => {
    if (!isPremium) return openPaywall('calendar');
    const target = addDays(week[0]!, 7);
    Alert.alert(t('calendar.week.duplicateTitle'), t('calendar.week.duplicateMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('calendar.week.duplicateConfirm'),
        onPress: () => {
          repos()
            .schedules.duplicateWeek(week[0]!, target)
            .then((n) => {
              afterWrite({ notifications: true });
              Alert.alert(n > 0 ? t('calendar.week.duplicated', { count: n }) : t('calendar.week.nothingToCopy'));
            })
            .catch((e) => {
              recordError(e, 'duplicate_week');
              Alert.alert(t('common.error'));
            });
        },
      },
    ]);
  };

  const nav = (delta: number) => {
    if (mode === 'month') setSelected(`${shiftMonth(monthKey, delta)}-01`);
    else setSelected(addDays(selected, delta * (mode === 'week' ? 7 : 1)));
  };
  const navLabel = mode === 'month' ? fmt.monthYear(monthKey) : mode === 'week' ? `${fmt.day(week[0]!, { day: 'numeric', month: 'short' })} – ${fmt.day(week[6]!, { day: 'numeric', month: 'short' })}` : fmt.day(selected, { weekday: 'long', day: 'numeric', month: 'long' });
  const prevLabel = mode === 'month' ? t('common.date.previousMonth') : mode === 'week' ? t('calendar.previousWeek') : t('calendar.previousDay');
  const nextLabel = mode === 'month' ? t('common.date.nextMonth') : mode === 'week' ? t('calendar.nextWeek') : t('calendar.nextDay');

  const dayPlans = byDate.get(selected) ?? EMPTY;

  return (
    <Screen>
      <PageHeader eyebrow={t('calendar.eyebrow')} title={t('calendar.title')} right={<IconButton icon="time-outline" label={t('calendar.history')} onPress={() => router.push('/history')} />} />
      <Segmented
        options={[
          { value: 'day', label: t('calendar.mode.day') },
          { value: 'week', label: t('calendar.mode.week') },
          { value: 'month', label: t('calendar.mode.month') },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={prevLabel} onPress={() => nav(-1)} />
        <PressableScale onPress={() => setSelected(today)} accessibilityRole="button" accessibilityLabel={t('calendar.goToday')} style={{ flex: 1, alignItems: 'center', minHeight: 40, justifyContent: 'center' }}>
          <Text variant="heading" center numberOfLines={1}>
            {navLabel}
          </Text>
        </PressableScale>
        <IconButton icon="chevron-forward" label={nextLabel} onPress={() => nav(1)} />
      </Row>

      {mode === 'month' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {grid.slice(0, 7).map((c) => (
            <Text key={`h${c.day}`} variant="caption" tone="subtle" center style={{ width: `${100 / 7}%`, paddingVertical: 4 }}>
              {fmt.weekdayShort(c.day)}
            </Text>
          ))}
          {grid.map((c) => {
            const plans = byDate.get(c.day) ?? EMPTY;
            const first = plans.find((p) => p.outfitId && outfitById.has(p.outfitId));
            const coverId = first ? coverItemId(outfitById.get(first.outfitId!)!.items, (id) => map.has(id)) : null;
            return (
              <DayCell
                key={c.day}
                day={c.day}
                inMonth={c.inMonth}
                isToday={c.day === today}
                planCount={plans.length}
                cover={coverId ? (map.get(coverId) ?? null) : null}
                label={`${fmt.day(c.day, { weekday: 'long', day: 'numeric', month: 'long' })}${plans.length ? `, ${t('calendar.plansCount', { count: plans.length })}` : ''}`}
                onPress={openDay}
              />
            );
          })}
        </View>
      ) : null}

      {mode === 'week' ? (
        <Stack gap={2}>
          {week.map((day) => {
            const plans = byDate.get(day) ?? EMPTY;
            const isToday = day === today;
            return (
              <Card key={day} onPress={() => openDay(day)} accessibilityLabel={fmt.day(day, { weekday: 'long', day: 'numeric', month: 'long' })} tone={isToday ? 'accent' : 'surface'} style={{ padding: theme.spacing(3) }}>
                <Row gap={3} style={{ alignItems: 'flex-start' }}>
                  <Stack gap={0} style={{ width: 44, alignItems: 'center' }}>
                    <Text variant="caption" tone="subtle">
                      {fmt.weekdayShort(day)}
                    </Text>
                    <Text variant="title">{Number(day.slice(8))}</Text>
                  </Stack>
                  {plans.length === 0 ? (
                    <Text tone="subtle" style={{ flex: 1, alignSelf: 'center' }}>
                      {t('calendar.week.nothingPlanned')}
                    </Text>
                  ) : (
                    <Stack gap={2} style={{ flex: 1 }}>
                      {plans.map((p) => {
                        const outfit = p.outfitId ? (outfitById.get(p.outfitId) ?? null) : null;
                        const occasion = labels.occasion(p.occasionId);
                        return (
                          <Row key={p.id} gap={2} style={{ alignItems: 'flex-start' }}>
                            <View style={{ width: 54 }}>{outfit ? <OutfitCollage refs={outfit.items} items={map} height={72} /> : null}</View>
                            <Stack gap={1} style={{ flex: 1 }}>
                              <Text variant="bodySmall" style={{ fontWeight: '600' }} numberOfLines={1}>
                                {outfit ? outfit.name : t('calendar.plan.noOutfitChosen')}
                              </Text>
                              <Row gap={1} wrap>
                                {occasion ? <Badge label={occasion} /> : null}
                                {p.wornLogged ? <Badge label={t('calendar.plan.worn')} tone="success" icon="checkmark" /> : null}
                              </Row>
                              {p.notes ? (
                                <Text variant="caption" tone="muted" numberOfLines={2}>
                                  {p.notes}
                                </Text>
                              ) : null}
                            </Stack>
                          </Row>
                        );
                      })}
                    </Stack>
                  )}
                </Row>
              </Card>
            );
          })}
          <Button variant="secondary" icon={isPremium ? 'copy-outline' : 'lock-closed-outline'} label={t('calendar.week.duplicate')} onPress={duplicateWeek} />
        </Stack>
      ) : null}

      {mode === 'day' ? (
        <Stack gap={3}>
          {dayPlans.length === 0 ? (
            <EmptyState icon="calendar-outline" title={t('calendar.day.emptyTitle')} message={t('calendar.day.emptyMessage')} />
          ) : (
            dayPlans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                outfit={p.outfitId ? (outfitById.get(p.outfitId) ?? null) : null}
                items={map}
                canWear={canMarkWorn(p.date, today)}
                onOpenOutfit={(o) => router.push({ pathname: '/outfit/[id]', params: { id: o.id } })}
                onEdit={() => openDay(p.date)}
                onToggleWorn={() => togglePlanWorn(t, p)}
                onDelete={() => deletePlan(t, p)}
              />
            ))
          )}
          <Button icon="add" label={t('calendar.day.addPlan')} onPress={() => openDay(selected)} />
        </Stack>
      ) : null}

      <ListRow icon="time-outline" title={t('calendar.history')} subtitle={t('calendar.historyHint')} onPress={() => router.push('/history')} />
    </Screen>
  );
}
