import { addDays, diffDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Icon, IconButton, PressableScale, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { AdBanner, PremiumGate } from '@/components/cards';
import { RecipeArt, Segmented } from '@/components/ui';
import { repos } from '@/database';
import { canPlanDay, copyWeek, groupBySlot, summarizeWeek, weekDays, weekStart, weekToTemplateEntries } from '@/domain/planner';
import { MEAL_SLOTS, type DayKey, type MealSlot, type PlanEntry } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { scheduleSync } from '@/services/planning';
import { recipesById } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

export default function Planner() {
  const { t, lng } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const today = clock.today();
  const [start, setStart] = useState(() => weekStart(today, firstDay));
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const days = weekDays(start);
  const offsetWeeks = Math.round(diffDays(weekStart(today, firstDay), start) / 7);
  const nextAllowed = canPlanDay(addDays(start, 7), today, firstDay, isPremium);
  const locked = !canPlanDay(start, today, firstDay, isPremium);

  const { data } = useAsync(async () => {
    const entries = await repos().plan.week(start);
    const recipes = await recipesById(entries.filter((e) => e.recipeId).map((e) => e.recipeId as string), lng);
    return { entries, recipes };
  }, [start, lng]);

  const entries = data?.entries ?? [];
  const summary = summarizeWeek(entries, start);
  const title = (e: PlanEntry) => (e.recipeId ? data?.recipes.get(e.recipeId)?.title : null) ?? e.customTitle ?? '';

  const afterWrite = () => {
    dataChanged();
    scheduleSync(t, lng);
  };

  const copyToNextWeek = () => {
    const target = addDays(start, 7);
    if (!canPlanDay(target, today, firstDay, isPremium)) return router.push({ pathname: '/paywall', params: { source: 'planner_copy_week' } });
    Alert.alert(t('planner.copyWeekTitle'), t('planner.copyWeekBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('planner.copy'),
        onPress: async () => {
          await repos().plan.addMany(copyWeek(entries, start, target));
          afterWrite();
          setStart(target);
        },
      },
    ]);
  };

  const clearWeek = () =>
    Alert.alert(t('planner.clearWeekTitle'), t('planner.clearWeekBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('planner.clear'),
        style: 'destructive',
        onPress: async () => {
          await repos().plan.clearRange(start, addDays(start, 6));
          afterWrite();
        },
      },
    ]);

  const saveAsTemplate = async () => {
    const count = await repos().templates.count();
    if (!isPremium && count >= 1) return router.push({ pathname: '/paywall', params: { source: 'save_template' } });
    const name = t('templates.myMenuName', { date: fmt.date(fromDayKey(start), { day: 'numeric', month: 'short' }) });
    await repos().templates.save({ name, icon: 'bookmark', entries: weekToTemplateEntries(entries, start) });
    dataChanged();
    Alert.alert(t('templates.saved'), t('templates.savedBody', { name }));
  };

  const rangeLabel = `${fmt.date(fromDayKey(start), { day: 'numeric', month: 'short' })} – ${fmt.date(fromDayKey(addDays(start, 6)), { day: 'numeric', month: 'short' })}`;

  return (
    <Screen testID="planner-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('planner.title')}
        </Text>
        <IconButton icon="albums-outline" label={t('templates.title')} onPress={() => router.push('/templates')} />
      </Row>

      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('planner.previousWeek')} onPress={() => setStart(addDays(start, -7))} />
        <View style={{ alignItems: 'center' }}>
          <Text variant="subheading">{offsetWeeks === 0 ? t('planner.thisWeek') : offsetWeeks === 1 ? t('planner.nextWeek') : rangeLabel}</Text>
          <Text variant="caption" tone="muted">
            {offsetWeeks === 0 || offsetWeeks === 1 ? rangeLabel : t('planner.mealsCount', { count: summary.planned })}
          </Text>
        </View>
        <IconButton
          icon="chevron-forward"
          label={t('planner.nextWeekA11y')}
          onPress={() => (nextAllowed ? setStart(addDays(start, 7)) : router.push({ pathname: '/paywall', params: { source: 'planner_weeks' } }))}
        />
      </Row>

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: t('planner.listView'), icon: 'list' },
          { value: 'calendar', label: t('planner.calendarView'), icon: 'grid' },
        ]}
      />

      {locked ? (
        <PremiumGate title={t('premium.unlimitedPlansTitle')} message={t('premium.unlimitedPlansBody')} source="planner_weeks" />
      ) : view === 'calendar' ? (
        <CalendarGrid days={days} entries={entries} today={today} title={title} recipes={data?.recipes} />
      ) : (
        days.map((day) => <DaySection key={day} day={day} today={today} entries={entries.filter((e) => e.day === day)} title={title} recipes={data?.recipes} />)
      )}

      {!locked ? (
        <Card>
          <Text variant="subheading">{t('planner.weekTools')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('planner.weekStats', { planned: summary.planned, cooked: summary.cooked })}
          </Text>
          <Button label={t('planner.groceryForWeek')} icon="cart-outline" size="md" onPress={() => router.push({ pathname: '/grocery/generate', params: { from: start, to: addDays(start, 6) } })} testID="week-grocery" />
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button label={t('planner.applyTemplate')} variant="secondary" size="md" icon="albums-outline" onPress={() => router.push({ pathname: '/templates', params: { start } })} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('planner.copyToNext')} variant="secondary" size="md" icon="copy-outline" onPress={copyToNextWeek} disabled={entries.length === 0} />
            </View>
          </Row>
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button label={t('planner.saveTemplate')} variant="secondary" size="md" icon="bookmark-outline" onPress={saveAsTemplate} disabled={entries.length === 0} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('planner.clearWeek')} variant="danger" size="md" icon="trash-outline" onPress={clearWeek} disabled={entries.length === 0} />
            </View>
          </Row>
        </Card>
      ) : null}
      <AdBanner screen="planner" />
      <View style={{ height: theme.spacing(2) }} />
    </Screen>
  );
}

type TitleFn = (e: PlanEntry) => string;
type RecipeMap = Map<string, { emoji: string; color: import('@/domain/types').ArtColor }> | undefined;

function DaySection({ day, today, entries, title, recipes }: { day: DayKey; today: DayKey; entries: PlanEntry[]; title: TitleFn; recipes: RecipeMap }) {
  const { t } = useLang();
  const theme = useTheme();
  const bySlot = groupBySlot(entries);
  const isToday = day === today;
  return (
    <Card style={isToday ? { borderColor: theme.colors.primary, borderWidth: 1.5 } : undefined} testID={`day-${day}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading" tone={isToday ? 'primary' : 'default'} style={{ textTransform: 'capitalize' }}>
          {fmt.dayLong(fromDayKey(day))}
        </Text>
        {isToday ? <Text variant="label" tone="primary">{t('common.today')}</Text> : null}
      </Row>
      {MEAL_SLOTS.map((slot) => (
        <SlotRow key={slot} day={day} slot={slot} entries={bySlot[slot]} title={title} recipes={recipes} />
      ))}
    </Card>
  );
}

function SlotRow({ day, slot, entries, title, recipes }: { day: DayKey; slot: MealSlot; entries: PlanEntry[]; title: TitleFn; recipes: RecipeMap }) {
  const { t } = useLang();
  const theme = useTheme();
  return (
    <View style={{ gap: 6, paddingVertical: 4 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {t(`slots.${slot}`)}
        </Text>
        <PressableScale
          onPress={() => router.push({ pathname: '/plan/add', params: { day, slot } })}
          accessibilityRole="button"
          accessibilityLabel={t('planner.addTo', { slot: t(`slots.${slot}`), day: fmt.dayLong(fromDayKey(day)) })}
          testID={`add-${day}-${slot}`}
          style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: theme.colors.surfaceAlt }}
        >
          <Row gap={1}>
            <Icon name="add" size={14} color={theme.colors.primary} />
            <Text variant="caption" tone="primary">
              {t('common.add')}
            </Text>
          </Row>
        </PressableScale>
      </Row>
      {entries.map((e) => {
        const r = e.recipeId ? recipes?.get(e.recipeId) : undefined;
        return (
          <PressableScale
            key={e.id}
            onPress={() => router.push({ pathname: '/plan/entry', params: { id: String(e.id) } })}
            accessibilityRole="button"
            accessibilityLabel={`${title(e)}, ${t('planner.servings', { count: e.servings })}${e.cookedAt ? `, ${t('planner.cooked')}` : ''}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }}
          >
            <RecipeArt emoji={r?.emoji ?? '🍽️'} color={r?.color ?? 'peach'} size={36} />
            <Text variant="bodySmall" style={{ flex: 1, fontWeight: '600' }} numberOfLines={2}>
              {title(e)}
            </Text>
            <Text variant="caption" tone="muted">
              ×{e.servings}
            </Text>
            {e.cookedAt ? <Icon name="checkmark-circle" size={18} color={theme.colors.success} /> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Compact 7-day × 4-slot grid. */
function CalendarGrid({ days, entries, today, title, recipes }: { days: DayKey[]; entries: PlanEntry[]; today: DayKey; title: TitleFn; recipes: RecipeMap }) {
  const { t } = useLang();
  const theme = useTheme();
  return (
    <Card style={{ padding: 8 }}>
      <Row gap={1}>
        <View style={{ width: 54 }} />
        {days.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" tone={d === today ? 'primary' : 'muted'} style={{ fontWeight: '700' }}>
              {fmt.weekday(fromDayKey(d))}
            </Text>
            <Text variant="caption" tone={d === today ? 'primary' : 'subtle'}>
              {fromDayKey(d).getDate()}
            </Text>
          </View>
        ))}
      </Row>
      {MEAL_SLOTS.map((slot) => (
        <Row key={slot} gap={1} style={{ alignItems: 'stretch' }}>
          <View style={{ width: 54, justifyContent: 'center' }}>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {t(`slotsShort.${slot}`)}
            </Text>
          </View>
          {days.map((d) => {
            const cell = entries.filter((e) => e.day === d && e.slot === slot);
            const first = cell[0];
            const r = first?.recipeId ? recipes?.get(first.recipeId) : undefined;
            return (
              <PressableScale
                key={d}
                onPress={() => (first ? router.push({ pathname: '/plan/entry', params: { id: String(first.id) } }) : router.push({ pathname: '/plan/add', params: { day: d, slot } }))}
                accessibilityRole="button"
                accessibilityLabel={first ? cell.map(title).join(', ') : t('planner.addTo', { slot: t(`slots.${slot}`), day: fmt.dayLong(fromDayKey(d)) })}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: first ? theme.colors.surfaceAlt : 'transparent',
                  borderWidth: first ? 0 : 1,
                  borderStyle: 'dashed',
                  borderColor: theme.colors.border,
                }}
              >
                {first ? (
                  <Text style={{ fontSize: 20 }} maxFontSizeMultiplier={1}>
                    {r?.emoji ?? '🍽️'}
                  </Text>
                ) : (
                  <Icon name="add" size={14} color={theme.colors.textSubtle} />
                )}
                {cell.length > 1 ? (
                  <Text variant="caption" tone="primary" style={{ position: 'absolute', top: 1, right: 4, fontSize: 10 }}>
                    +{cell.length - 1}
                  </Text>
                ) : null}
              </PressableScale>
            );
          })}
        </Row>
      ))}
      <Stack gap={1} style={{ marginTop: 8 }}>
        <Text variant="caption" tone="subtle">
          {t('planner.calendarHint')}
        </Text>
      </Stack>
    </Card>
  );
}
