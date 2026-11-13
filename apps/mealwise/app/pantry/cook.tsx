import { Card, EmptyState, Row, Screen, Text } from '@factory/design-system';

import { PremiumGate, RecipeCard } from '@/components/cards';
import { Note } from '@/components/ui';
import { repos } from '@/database';
import { ingredientName } from '@/domain/ingredients';
import { cookableRecipes } from '@/domain/pantry';
import { canOpenRecipe } from '@/domain/recipes';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { allRecipes } from '@/services/recipeCatalog';
import { useIsPremium } from '@/store/session';

/** Recipes doable with what is at home (premium: advanced pantry). */
export default function PantryCook() {
  const { t, lng } = useLang();
  const isPremium = useIsPremium();
  const { data } = useAsync(async () => {
    const [recipes, pantry] = await Promise.all([allRecipes(lng), repos().pantry.active()]);
    return { matches: cookableRecipes(recipes.filter((r) => canOpenRecipe(r, isPremium)), pantry, 2), pantryCount: pantry.length };
  }, [lng, isPremium]);

  if (!isPremium) {
    return (
      <Screen edges={[]}>
        <PremiumGate title={t('premium.pantryTitle')} message={t('premium.pantryBody')} source="pantry_cook" />
      </Screen>
    );
  }
  const ready = data?.matches.filter((m) => m.missing.length === 0) ?? [];
  const almost = data?.matches.filter((m) => m.missing.length > 0) ?? [];

  return (
    <Screen edges={[]}>
      {data && data.pantryCount === 0 ? <EmptyState icon="file-tray-outline" title={t('pantry.emptyTitle')} message={t('pantry.cookEmpty')} /> : null}
      {ready.length ? <Text variant="heading">{t('pantry.readyToCook', { count: ready.length })}</Text> : null}
      {ready.map((m) => (
        <RecipeCard key={m.recipe.id} recipe={m.recipe} />
      ))}
      {almost.length ? <Text variant="heading">{t('pantry.almost', { count: almost.length })}</Text> : null}
      {almost.slice(0, 30).map((m) => (
        <Card key={m.recipe.id}>
          <RecipeCard recipe={m.recipe} compact />
          <Row gap={1} wrap>
            <Text variant="caption" tone="warning">
              {t('pantry.missing', { items: m.missing.map((i) => ingredientName(i.key, lng, i.name)).join(', ') })}
            </Text>
          </Row>
        </Card>
      ))}
      {data && data.pantryCount > 0 && data.matches.length === 0 ? <EmptyState icon="search-outline" title={t('pantry.noMatch')} /> : null}
      <Note>{t('pantry.cookNote')}</Note>
    </Screen>
  );
}
