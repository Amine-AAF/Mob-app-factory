import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Chip, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { RecipeCard } from '@/components/cards';
import { Field, Segmented, Stepper } from '@/components/ui';
import { repos } from '@/database';
import { canPlanDay, duplicateDay } from '@/domain/planner';
import { MEAL_SLOTS, type MealSlot } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { scheduleSync } from '@/services/planning';
import { getRecipe } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

/** One planned meal: servings, note, move, duplicate, cooked, remove. */
export default function PlanEntryScreen() {
  const { t, lng } = useLang();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = Number(id);
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const today = clock.today();
  const [action, setAction] = useState<'move' | 'duplicate' | 'copyDay'>('move');
  const [targetDay, setTargetDay] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<MealSlot | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const { data, reload } = useAsync(async () => {
    const entry = await repos().plan.get(entryId);
    const recipe = entry?.recipeId ? await getRecipe(entry.recipeId, lng) : null;
    return { entry, recipe };
  }, [entryId, lng]);

  const entry = data?.entry;
  if (data && !entry) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="calendar-outline" title={t('planner.entryGone')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  if (!entry) return <Screen edges={[]}>{null}</Screen>;

  const changed = () => {
    dataChanged();
    scheduleSync(t, lng);
    reload();
  };
  const day = targetDay ?? entry.day;
  const slot = targetSlot ?? entry.slot;
  const dayOptions = Array.from({ length: 15 }, (_, i) => addDays(today, i - 1));

  const apply = async () => {
    if (!canPlanDay(day, today, firstDay, isPremium)) return router.push({ pathname: '/paywall', params: { source: 'planner_weeks' } });
    if (action === 'move') await repos().plan.move(entry.id, day, slot);
    else if (action === 'duplicate') await repos().plan.duplicate(entry.id, day, slot);
    else {
      const dayEntries = await repos().plan.range(entry.day, entry.day);
      await repos().plan.addMany(duplicateDay(dayEntries, entry.day, day));
    }
    changed();
    router.back();
  };

  const remove = () =>
    Alert.alert(t('planner.removeTitle'), t('planner.removeBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          await repos().plan.remove(entry.id);
          changed();
          router.back();
        },
      },
    ]);

  const title = data?.recipe?.title ?? entry.customTitle ?? '';

  return (
    <Screen edges={[]}>
      <Stack gap={1}>
        <Text variant="caption" tone="muted" style={{ textTransform: 'capitalize' }}>
          {fmt.dayLong(fromDayKey(entry.day))} · {t(`slots.${entry.slot}`)}
        </Text>
        <Text variant="title">{title}</Text>
      </Stack>

      {data?.recipe ? <RecipeCard recipe={data.recipe} /> : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('recipe.servings')}</Text>
          <Stepper
            value={entry.servings}
            onChange={async (v) => {
              await repos().plan.update(entry.id, { servings: v });
              changed();
            }}
            min={1}
            max={20}
            label={t('recipe.servings')}
          />
        </Row>
        <Field
          label={t('planner.note')}
          value={note ?? entry.note ?? ''}
          onChangeText={setNote}
          placeholder={t('planner.notePlaceholder')}
          maxLength={200}
        />
        {note !== null && note !== (entry.note ?? '') ? (
          <Button
            label={t('common.save')}
            size="md"
            variant="secondary"
            onPress={async () => {
              await repos().plan.update(entry.id, { note: note.trim() || null });
              setNote(null);
              changed();
            }}
          />
        ) : null}
      </Card>

      <Row gap={2}>
        {data?.recipe ? (
          <View style={{ flex: 1 }}>
            <Button label={t('cook.start')} icon="flame" onPress={() => router.push({ pathname: '/cook/[id]', params: { id: data.recipe!.id, servings: String(entry.servings), entry: String(entry.id) } })} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Button
            label={entry.cookedAt ? t('planner.markNotCooked') : t('planner.markCooked')}
            variant="secondary"
            icon={entry.cookedAt ? 'refresh' : 'checkmark-done'}
            onPress={async () => {
              await repos().plan.setCooked(entry.id, !entry.cookedAt);
              if (!entry.cookedAt && entry.recipeId) await repos().recipes.logHistory(entry.recipeId, 'cooked');
              changed();
            }}
          />
        </View>
      </Row>

      <Card>
        <Segmented
          value={action}
          onChange={setAction}
          options={[
            { value: 'move', label: t('planner.move') },
            { value: 'duplicate', label: t('planner.duplicate') },
            { value: 'copyDay', label: t('planner.copyDay') },
          ]}
        />
        <Text variant="bodySmall" tone="muted">
          {t(`planner.${action}Hint`)}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {dayOptions.map((d) => (
            <Chip key={d} label={d === today ? t('common.today') : fmt.dayShort(fromDayKey(d))} selected={d === day} onPress={() => setTargetDay(d)} />
          ))}
        </ScrollView>
        {action !== 'copyDay' ? (
          <Row gap={2} wrap>
            {MEAL_SLOTS.map((s) => (
              <Chip key={s} label={t(`slots.${s}`)} selected={s === slot} onPress={() => setTargetSlot(s)} />
            ))}
          </Row>
        ) : null}
        <Button
          label={t(`planner.${action}Action`)}
          size="md"
          icon={action === 'move' ? 'swap-horizontal' : 'copy-outline'}
          onPress={apply}
          disabled={(action === 'move' && day === entry.day && slot === entry.slot) || (action === 'copyDay' && day === entry.day)}
          testID="entry-apply"
        />
      </Card>

      <Button label={t('planner.removeMeal')} variant="danger" icon="trash-outline" onPress={remove} />
    </Screen>
  );
}
