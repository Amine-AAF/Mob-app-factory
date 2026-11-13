import { Badge, Button, Card, Divider, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { PremiumGate } from '@/components/cards';
import { Note, RecipeHero, Stepper, useQuantityLabel } from '@/components/ui';
import { repos } from '@/database';
import { estimateRecipeCost, formatMoney } from '@/domain/budget';
import { aggregateIngredients, toGroceryDrafts } from '@/domain/grocery';
import { ingredientName } from '@/domain/ingredients';
import { estimateRecipeNutrition, macroSplit } from '@/domain/nutrition';
import { availability } from '@/domain/pantry';
import { servingsFactor } from '@/domain/quantity';
import { canCreateRecipe, canOpenRecipe, totalMinutes } from '@/domain/recipes';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { shareText } from '@/services/files';
import { recipeAsText } from '@/services/share';
import { getRecipe } from '@/services/recipeCatalog';
import { dataChanged, useIsPremium } from '@/store/session';

export default function RecipeScreen() {
  const { t, lng, currency, system } = useLang();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isPremium = useIsPremium();
  const q = useQuantityLabel();
  const [servings, setServings] = useState<number | null>(null);
  const [original, setOriginal] = useState(false);

  const { data } = useAsync(async () => {
    const recipe = await getRecipe(id, lng);
    const r = repos();
    const [fav, pantry, prices, userCount] = await Promise.all([r.recipes.favorites(), r.pantry.active(), r.budget.prices(), r.recipes.count()]);
    return { recipe, favorite: fav.has(id), pantry, prices, userCount };
  }, [id, lng]);

  useEffect(() => {
    if (data?.recipe) void repos().recipes.logHistory(data.recipe.id, 'viewed');
  }, [data?.recipe]);

  if (data && !data.recipe) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="book-outline" title={t('recipe.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }
  const recipe = data?.recipe;
  if (!recipe) return <Screen edges={[]}>{null}</Screen>;

  const portions = servings ?? recipe.servings;
  const factor = servingsFactor(recipe.servings, portions);
  const locked = !canOpenRecipe(recipe, isPremium);
  const nutrition = estimateRecipeNutrition(recipe);
  const split = macroSplit(nutrition.perServing);
  const cost = estimateRecipeCost(recipe, portions, data.prices);
  const pantryCount = data.pantry.length;

  const toggleFavorite = async () => {
    await repos().recipes.setFavorite(recipe.id, !data.favorite);
    dataChanged();
  };

  const duplicate = async () => {
    if (!canCreateRecipe(data.userCount, isPremium)) return router.push({ pathname: '/paywall', params: { source: 'recipe_limit' } });
    const newId = await repos().recipes.create({
      ...recipe,
      title: t('recipe.copyOf', { title: recipe.title }),
      ingredients: recipe.ingredients,
    });
    track('recipe_created', { source: 'duplicate' });
    dataChanged();
    router.replace({ pathname: '/recipe/edit', params: { id: newId } });
  };

  const remove = () =>
    Alert.alert(t('recipe.deleteTitle'), t('recipe.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().recipes.remove(recipe.id);
          dataChanged();
          router.back();
        },
      },
    ]);

  const addToGrocery = async () => {
    const r = repos();
    const list = (await r.grocery.active()) ?? (await r.grocery.getList(await r.grocery.createList(t('grocery.defaultName'), { start: null, end: null })));
    if (!list) return;
    const drafts = toGroceryDrafts(aggregateIngredients([{ recipeId: recipe.id, baseServings: recipe.servings, servings: portions, ingredients: recipe.ingredients }]), system, lng);
    for (const d of drafts) await r.grocery.addManual(list.id, { ...d }, system);
    dataChanged();
    Alert.alert(t('grocery.added'), t('grocery.addedBody', { count: drafts.length }));
  };

  return (
    <>
      <RouterStack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Row gap={0}>
              {!locked ? <IconButton icon="share-social-outline" label={t('common.share')} onPress={() => void shareText(recipeAsText(recipe, portions, q, t, lng), recipe.title)} /> : null}
              <IconButton icon={data.favorite ? 'heart' : 'heart-outline'} tone={data.favorite ? 'primary' : 'default'} label={data.favorite ? t('recipe.unfavorite') : t('recipe.favorite')} onPress={toggleFavorite} />
            </Row>
          ),
        }}
      />
      <Screen edges={[]} testID="recipe-screen">
        <RecipeHero emoji={recipe.emoji} color={recipe.color} />
        <Stack gap={2}>
          <Text variant="title">{recipe.title}</Text>
          {recipe.description ? <Text tone="muted">{recipe.description}</Text> : null}
          <Row gap={2} wrap>
            {recipe.categories.map((c) => (
              <Badge key={c} label={t(`categories.${c}`)} tone={c === 'vegan' || c === 'vegetarian' ? 'success' : 'neutral'} />
            ))}
            {recipe.tags.map((tag) => (
              <Badge key={tag} label={t(`tags.${tag}`, { defaultValue: tag })} tone="accent" />
            ))}
            {recipe.premium ? <Badge label={t('premium.badge')} tone="warning" icon="sparkles" /> : null}
          </Row>
        </Stack>

        <Row gap={2}>
          {(
            [
              ['hourglass-outline', t('recipe.prep'), fmt.minutes(recipe.prepMinutes)],
              ['flame-outline', t('recipe.cook'), fmt.minutes(recipe.cookMinutes)],
              ['speedometer-outline', t('recipe.difficulty'), t(`difficulty.${recipe.difficulty}`)],
            ] as const
          ).map(([icon, label, value]) => (
            <View key={label} accessible accessibilityLabel={`${label}: ${value}`} style={{ flex: 1, padding: 10, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, gap: 2 }}>
              <Icon name={icon} size={16} color={theme.colors.primary} />
              <Text variant="subheading">{value}</Text>
              <Text variant="caption" tone="muted">
                {label}
              </Text>
            </View>
          ))}
        </Row>

        {locked ? (
          <PremiumGate title={t('premium.recipeLockedTitle')} message={t('premium.recipeLockedBody')} source="premium_recipe" />
        ) : (
          <>
            <Row gap={2}>
              <View style={{ flex: 1 }}>
                <Button label={t('cook.start')} icon="flame" onPress={() => router.push({ pathname: '/cook/[id]', params: { id: recipe.id, servings: String(portions) } })} testID="start-cooking" />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('planner.addToPlan')} icon="calendar-outline" variant="secondary" onPress={() => router.push({ pathname: '/plan/add', params: { recipeId: recipe.id } })} testID="add-to-plan" />
              </View>
            </Row>

            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="subheading">{t('recipe.servings')}</Text>
                <Stepper value={portions} onChange={setServings} min={1} max={24} label={t('recipe.servings')} />
              </Row>
              {portions !== recipe.servings ? (
                <Text variant="caption" tone="muted">
                  {t('recipe.scaledFrom', { count: recipe.servings })}
                </Text>
              ) : null}
            </Card>

            <SectionHeader title={t('recipe.ingredients')} action={original ? t('recipe.convertedUnits') : t('recipe.originalUnits')} onAction={() => setOriginal(!original)} />
            <Card>
              {recipe.ingredients.map((ing, i) => {
                const a = pantryCount ? availability(ing, data.pantry, factor) : null;
                return (
                  <View key={`${ing.key}-${i}`}>
                    {i > 0 ? <Divider /> : null}
                    <Row gap={3} style={{ paddingVertical: 8 }}>
                      <Text variant="subheading" style={{ minWidth: 92 }} tone="primary">
                        {q(ing.quantity, ing.unit, { factor, original: original || undefined })}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text>
                          {ingredientName(ing.key, lng, ing.name)}
                          {ing.optional ? ` (${t('recipe.optional')})` : ''}
                        </Text>
                        {ing.note ? (
                          <Text variant="caption" tone="muted">
                            {ing.note}
                          </Text>
                        ) : null}
                      </View>
                      {a === 'have' ? (
                        <Icon name="checkmark-circle" size={18} color={theme.colors.success} accessibilityLabel={t('pantry.inPantry')} />
                      ) : a === 'not_enough' ? (
                        <Icon name="alert-circle-outline" size={18} color={theme.colors.warning} accessibilityLabel={t('pantry.notEnough')} />
                      ) : null}
                    </Row>
                  </View>
                );
              })}
              <Button label={t('recipe.addToGrocery')} icon="cart-outline" size="md" variant="secondary" onPress={addToGrocery} />
            </Card>

            <SectionHeader title={t('recipe.steps')} />
            {recipe.steps.map((s, i) => (
              <Row key={i} gap={3} style={{ alignItems: 'flex-start' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" tone="primary" style={{ fontWeight: '800' }}>
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text>{s.text}</Text>
                  {s.timerMinutes ? <Badge label={t('cook.timerMinutes', { count: s.timerMinutes })} icon="timer-outline" tone="neutral" /> : null}
                </View>
              </Row>
            ))}

            <SectionHeader title={t('nutrition.perServing')} />
            <Card>
              {nutrition.source === 'unavailable' ? (
                <Text variant="bodySmall" tone="muted">
                  {t('nutrition.unavailable')}
                </Text>
              ) : (
                <>
                  <Row style={{ justifyContent: 'space-between' }}>
                    {(['kcal', 'protein', 'carbs', 'fat'] as const).map((k) => (
                      <View key={k} style={{ alignItems: 'center', flex: 1 }}>
                        <Text variant="heading">{k === 'kcal' ? `≈${nutrition.perServing[k]}` : `≈${nutrition.perServing[k]} g`}</Text>
                        <Text variant="caption" tone="muted">
                          {t(`nutrition.${k}`)}
                        </Text>
                      </View>
                    ))}
                  </Row>
                  {split ? (
                    <Text variant="caption" tone="muted" center>
                      {t('nutrition.split', { protein: Math.round(split.protein * 100), carbs: Math.round(split.carbs * 100), fat: Math.round(split.fat * 100) })}
                    </Text>
                  ) : null}
                </>
              )}
              <Note>
                {nutrition.source === 'documented'
                  ? t('nutrition.documentedNote')
                  : nutrition.source === 'estimated'
                    ? t('nutrition.estimateNote', { percent: Math.round(nutrition.coverage * 100) })
                    : t('nutrition.missingNote')}
              </Note>
            </Card>

            <SectionHeader title={t('budget.recipeCost')} />
            {isPremium ? (
              <Card>
                {cost.coverage > 0 ? (
                  <Text variant="heading">
                    ≈ {formatMoney(cost.total, currency, lng)} · {t('budget.perServing', { price: formatMoney(cost.perServing, currency, lng) })}
                  </Text>
                ) : null}
                <Note>{cost.coverage > 0 ? t('budget.costCoverage', { percent: Math.round(cost.coverage * 100) }) : t('budget.noPrices')}</Note>
              </Card>
            ) : (
              <PremiumGate title={t('premium.costTitle')} message={t('premium.costBody')} source="recipe_cost" />
            )}

            <Text variant="caption" tone="subtle">
              {t('recipe.totalTime', { time: fmt.minutes(totalMinutes(recipe)) })} · {recipe.source === 'builtin' ? t('recipe.sourceBuiltin') : t('recipe.sourceUser')}
            </Text>
            {recipe.source === 'user' ? (
              <Row gap={2}>
                <View style={{ flex: 1 }}>
                  <Button label={t('common.edit')} icon="create-outline" variant="secondary" onPress={() => router.push({ pathname: '/recipe/edit', params: { id: recipe.id } })} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label={t('common.delete')} icon="trash-outline" variant="danger" onPress={remove} />
                </View>
              </Row>
            ) : (
              <Button label={t('recipe.duplicateEdit')} icon="copy-outline" variant="secondary" onPress={duplicate} />
            )}
          </>
        )}
        <View style={{ height: 8 }} />
      </Screen>
    </>
  );
}

