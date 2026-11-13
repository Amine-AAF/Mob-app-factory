import { addDays, fromDayKey } from '@factory/app-core';
import { Card, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { View } from 'react-native';

import { PremiumGate } from '@/components/cards';
import { Bar, Note, Segmented } from '@/components/ui';
import { repos } from '@/database';
import { estimateRecipeNutrition, macroSplit, sumNutrition, type NutritionTotal } from '@/domain/nutrition';
import { weekDays, weekStart } from '@/domain/planner';
import type { PlanEntry, Recipe } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { recipesById } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** One person's portion per planned meal. */
function totalsFor(entries: readonly PlanEntry[], recipes: ReadonlyMap<string, Recipe>): NutritionTotal {
  return sumNutrition(
    entries.map((e) => {
      const r = e.recipeId ? recipes.get(e.recipeId) : undefined;
      return { servingsEaten: 1, result: r ? estimateRecipeNutrition(r) : { perServing: { kcal: null, protein: null, carbs: null, fat: null }, source: 'unavailable' as const, coverage: 0, missing: [] } };
    }),
  );
}

export default function Nutrition() {
  const { t, lng } = useLang();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const [view, setView] = useState<'day' | 'week'>('day');
  const [day, setDay] = useState(clock.today());
  const start = weekStart(day, firstDay);

  const { data } = useAsync(async () => {
    const entries = await repos().plan.week(start);
    const recipes = await recipesById(entries.filter((e) => e.recipeId).map((e) => e.recipeId as string), lng);
    return { entries, recipes };
  }, [start, lng]);

  const dayEntries = data?.entries.filter((e) => e.day === day) ?? [];
  const dayTotal = data ? totalsFor(dayEntries, data.recipes) : null;
  const perDay = data ? weekDays(start).map((d) => ({ d, total: totalsFor(data.entries.filter((e) => e.day === d), data.recipes) })) : [];
  const counted = perDay.filter((x) => x.total.counted > 0);
  const avgKcal = counted.length ? Math.round(counted.reduce((s, x) => s + (x.total.total.kcal ?? 0), 0) / counted.length) : null;
  const maxKcal = Math.max(1, ...perDay.map((x) => x.total.total.kcal ?? 0));
  const weekTotal = data ? totalsFor(data.entries, data.recipes) : null;
  const split = weekTotal ? macroSplit(weekTotal.total) : null;

  return (
    <Screen edges={[]}>
      <Note icon="medkit-outline">{t('nutrition.disclaimer')}</Note>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: t('nutrition.daily') },
          { value: 'week', label: t('nutrition.weekly') },
        ]}
      />
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('common.previous')} onPress={() => setDay(addDays(day, view === 'day' ? -1 : -7))} />
        <Text variant="subheading" style={{ textTransform: 'capitalize' }}>
          {view === 'day' ? fmt.dayLong(fromDayKey(day)) : `${fmt.date(fromDayKey(start), { day: 'numeric', month: 'short' })} – ${fmt.date(fromDayKey(addDays(start, 6)), { day: 'numeric', month: 'short' })}`}
        </Text>
        <IconButton icon="chevron-forward" label={t('common.next')} onPress={() => setDay(addDays(day, view === 'day' ? 1 : 7))} />
      </Row>

      {view === 'day' && dayTotal ? (
        <>
          <Card>
            <Text variant="label" tone="muted">
              {t('nutrition.dayTotal')}
            </Text>
            {dayTotal.counted ? (
              <Row style={{ justifyContent: 'space-between' }}>
                {(['kcal', 'protein', 'carbs', 'fat'] as const).map((k) => (
                  <View key={k} style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="heading">{k === 'kcal' ? `≈${dayTotal.total[k]}` : `≈${dayTotal.total[k]} g`}</Text>
                    <Text variant="caption" tone="muted">
                      {t(`nutrition.${k}`)}
                    </Text>
                  </View>
                ))}
              </Row>
            ) : (
              <Text tone="muted">{dayEntries.length ? t('nutrition.noData') : t('nutrition.noMeals')}</Text>
            )}
            {dayTotal.uncounted ? (
              <Text variant="caption" tone="warning">
                {t('nutrition.uncounted', { count: dayTotal.uncounted })}
              </Text>
            ) : null}
          </Card>
          {dayEntries.map((e) => {
            const r = e.recipeId ? data?.recipes.get(e.recipeId) : undefined;
            const n = r ? estimateRecipeNutrition(r) : null;
            return (
              <Card key={e.id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="muted">
                    {t(`slots.${e.slot}`)}
                  </Text>
                  <Text variant="caption" tone={n?.source === 'documented' ? 'success' : 'muted'}>
                    {n?.source === 'documented' ? t('nutrition.documented') : n?.source === 'estimated' ? t('nutrition.estimated') : t('nutrition.unknown')}
                  </Text>
                </Row>
                <Text variant="subheading">{r?.title ?? e.customTitle}</Text>
                {n && n.source !== 'unavailable' ? (
                  <Text variant="bodySmall" tone="muted">
                    {t('nutrition.line', { kcal: n.perServing.kcal, protein: n.perServing.protein, carbs: n.perServing.carbs, fat: n.perServing.fat })}
                  </Text>
                ) : null}
              </Card>
            );
          })}
        </>
      ) : null}

      {view === 'week' ? (
        isPremium ? (
          <>
            <Card>
              <Text variant="label" tone="muted">
                {t('nutrition.avgPerDay')}
              </Text>
              <Text variant="title">{avgKcal !== null ? `≈ ${avgKcal} kcal` : '—'}</Text>
              <Text variant="caption" tone="muted">
                {t('nutrition.daysCounted', { count: counted.length })}
              </Text>
              <Stack gap={2} style={{ marginTop: 8 }}>
                {perDay.map(({ d, total }) => (
                  <Row key={d} gap={2}>
                    <Text variant="caption" tone="muted" style={{ width: 40 }}>
                      {fmt.weekday(fromDayKey(d))}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Bar ratio={(total.total.kcal ?? 0) / maxKcal} color={theme.colors.primary} />
                    </View>
                    <Text variant="caption" style={{ width: 64, textAlign: 'right' }}>
                      {total.counted ? `${total.total.kcal}` : '—'}
                    </Text>
                  </Row>
                ))}
              </Stack>
            </Card>
            {split ? (
              <Card>
                <Text variant="label" tone="muted">
                  {t('nutrition.macroSplit')}
                </Text>
                {(
                  [
                    ['protein', split.protein, theme.colors.primary],
                    ['carbs', split.carbs, theme.colors.accent],
                    ['fat', split.fat, theme.colors.warning],
                  ] as const
                ).map(([k, v, c]) => (
                  <Stack key={k} gap={1}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <Text variant="bodySmall">{t(`nutrition.${k}`)}</Text>
                      <Text variant="bodySmall">{Math.round(v * 100)} %</Text>
                    </Row>
                    <Bar ratio={v} color={c} />
                  </Stack>
                ))}
                <Text variant="caption" tone="subtle">
                  {t('nutrition.splitNote')}
                </Text>
              </Card>
            ) : null}
          </>
        ) : (
          <PremiumGate title={t('premium.nutritionTitle')} message={t('premium.nutritionBody')} source="nutrition_week" />
        )
      ) : null}
      <Note>{t('nutrition.methodNote')}</Note>
    </Screen>
  );
}
