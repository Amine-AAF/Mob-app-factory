import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { RecipeCard } from '@/components/cards';
import { Field, Segmented, Stepper } from '@/components/ui';
import { repos } from '@/database';
import { canPlanDay } from '@/domain/planner';
import { canOpenRecipe, defaultSlotFor, filterRecipes } from '@/domain/recipes';
import { MEAL_SLOTS, type MealSlot, type Recipe } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { defaultServings, scheduleSync } from '@/services/planning';
import { allRecipes } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

/** Adds a recipe or a custom meal to a day/slot. Reached from the planner or from a recipe. */
export default function AddMeal() {
  const { t, lng } = useLang();
  const params = useLocalSearchParams<{ day?: string; slot?: string; recipeId?: string }>();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const diet = usePreferences((s) => s.diet);
  const today = clock.today();
  const [day, setDay] = useState(params.day ?? today);
  const [slot, setSlot] = useState<MealSlot>((MEAL_SLOTS as readonly string[]).includes(params.slot ?? '') ? (params.slot as MealSlot) : 'dinner');
  const [mode, setMode] = useState<'recipe' | 'custom'>('recipe');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Recipe | null>(null);
  const [custom, setCustom] = useState('');
  const [servings, setServings] = useState(defaultServings());
  const [busy, setBusy] = useState(false);

  const { data: recipes } = useAsync(async () => {
    const list = await allRecipes(lng);
    const fav = await repos().recipes.favorites();
    return { list, fav };
  }, [lng]);

  // Preselected recipe (from the recipe screen).
  const preset = useMemo(() => recipes?.list.find((r) => r.id === params.recipeId) ?? null, [recipes, params.recipeId]);
  const current = picked ?? preset;
  // Until the user picks a slot, a preset recipe suggests its natural slot (breakfast, dinner…).
  const [slotTouched, setSlotTouched] = useState(Boolean(params.slot));
  const effectiveSlot: MealSlot = !slotTouched && preset ? defaultSlotFor(preset) : slot;
  const chooseSlot = (s: MealSlot) => {
    setSlotTouched(true);
    setSlot(s);
  };

  const results = useMemo(() => {
    if (!recipes) return [];
    const filtered = filterRecipes(recipes.list, { query, categories: diet !== 'none' && !query ? [diet] : [] }, { lng, favorites: recipes.fav });
    // Favourites first when not searching.
    return query ? filtered.slice(0, 40) : [...filtered.filter((r) => recipes.fav.has(r.id)), ...filtered.filter((r) => !recipes.fav.has(r.id))].slice(0, 40);
  }, [recipes, query, lng, diet]);

  const dayOptions = Array.from({ length: 14 }, (_, i) => addDays(today, i - 1));
  const allowed = canPlanDay(day, today, firstDay, isPremium);

  const save = async () => {
    if (!allowed) return router.push({ pathname: '/paywall', params: { source: 'planner_weeks' } });
    setBusy(true);
    try {
      if (mode === 'recipe' && current) {
        await repos().plan.add({ day, slot: effectiveSlot, recipeId: current.id, customTitle: null, servings, note: null });
        track('meal_planned', { slot: effectiveSlot, builtin: current.source === 'builtin' });
      } else if (mode === 'custom' && custom.trim()) {
        await repos().plan.add({ day, slot: effectiveSlot, recipeId: null, customTitle: custom.trim(), servings, note: null });
      } else return;
      dataChanged();
      scheduleSync(t, lng);
      router.back();
    } finally {
      setBusy(false);
    }
  };

  const canSave = mode === 'recipe' ? !!current && canOpenRecipe(current, isPremium) : custom.trim().length > 0;

  return (
    <Screen edges={[]} footer={<Button label={t('planner.addToPlan')} icon="checkmark" onPress={save} disabled={!canSave || busy} loading={busy} testID="add-meal-save" />}>
      <Text variant="label" tone="muted">
        {t('planner.when')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {dayOptions.map((d) => (
          <Chip key={d} label={d === today ? t('common.today') : fmt.dayShort(fromDayKey(d))} selected={d === day} onPress={() => setDay(d)} />
        ))}
      </ScrollView>
      <Row gap={2} wrap>
        {MEAL_SLOTS.map((s) => (
          <Chip key={s} label={t(`slots.${s}`)} selected={s === effectiveSlot} onPress={() => chooseSlot(s)} testID={`slot-${s}`} />
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading">{t('recipe.servings')}</Text>
        <Stepper value={servings} onChange={setServings} min={1} max={20} label={t('recipe.servings')} />
      </Row>
      {!allowed ? (
        <Text variant="bodySmall" tone="warning">
          {t('premium.unlimitedPlansBody')}
        </Text>
      ) : null}

      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'recipe', label: t('planner.fromRecipe'), icon: 'book-outline' },
          { value: 'custom', label: t('planner.customMeal'), icon: 'create-outline' },
        ]}
      />

      {mode === 'custom' ? (
        <Stack gap={2}>
          <Field label={t('planner.customTitle')} value={custom} onChangeText={setCustom} placeholder={t('planner.customPlaceholder')} maxLength={80} testID="custom-meal" />
          <Text variant="caption" tone="subtle">
            {t('planner.customHint')}
          </Text>
        </Stack>
      ) : (
        <Stack gap={3}>
          {current ? (
            <Card tone="primary">
              <Text variant="label" tone="primary">
                {t('planner.selected')}
              </Text>
              <RecipeCard recipe={current} onPress={() => setPicked(null)} />
            </Card>
          ) : null}
          <Field value={query} onChangeText={setQuery} placeholder={t('recipes.searchPlaceholder')} testID="add-meal-search" />
          {results.map((r) => (
            <View key={r.id} style={{ opacity: current?.id === r.id ? 0.5 : 1 }}>
              <RecipeCard
                recipe={r}
                compact
                favorite={recipes?.fav.has(r.id)}
                onPress={() => (canOpenRecipe(r, isPremium) ? setPicked(r) : router.push({ pathname: '/paywall', params: { source: 'premium_recipe' } }))}
                testID={`pick-${r.id}`}
              />
            </View>
          ))}
        </Stack>
      )}
    </Screen>
  );
}
