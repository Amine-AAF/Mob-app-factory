import { fromDayKey } from '@factory/app-core';
import { Card, EmptyState, Row, Screen, SectionHeader, Text } from '@factory/design-system';

import { RecipeCard } from '@/components/cards';
import { Segmented } from '@/components/ui';
import { repos } from '@/database';
import type { Recipe } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { entryTitles } from '@/services/planning';
import { recipesById } from '@/services/recipeCatalog';
import { useState } from 'react';

/** Recently viewed/cooked recipes and the log of meals marked as cooked. */
export default function History() {
  const { t, lng } = useLang();
  const [tab, setTab] = useState<'recipes' | 'meals'>('recipes');
  const { data } = useAsync(async () => {
    const recent = await repos().recipes.recent(30);
    const map = await recipesById(recent.map((r) => r.recipeId), lng);
    const cooked = await repos().plan.cookedHistory(60);
    const titles = await entryTitles(cooked, lng);
    return { recent: recent.map((r) => ({ ...r, recipe: map.get(r.recipeId) })).filter((r): r is typeof r & { recipe: Recipe } => !!r.recipe), cooked, titles };
  }, [lng]);

  return (
    <Screen edges={[]}>
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'recipes', label: t('history.recipes') },
          { value: 'meals', label: t('history.meals') },
        ]}
      />
      {tab === 'recipes' ? (
        data?.recent.length ? (
          data.recent.map((r) => (
            <Card key={r.recipeId}>
              <RecipeCard recipe={r.recipe} compact />
              <Text variant="caption" tone="muted">
                {fmt.date(new Date(r.at))}
                {r.cooked ? ` · ${t('history.cookedTimes', { count: r.cooked })}` : ''}
              </Text>
            </Card>
          ))
        ) : (
          <EmptyState icon="time-outline" title={t('history.empty')} />
        )
      ) : data?.cooked.length ? (
        <>
          <SectionHeader title={t('history.mealsCooked', { count: data.cooked.length })} />
          {data.cooked.map((e) => (
            <Row key={e.id} style={{ justifyContent: 'space-between', minHeight: 40 }}>
              <Text style={{ flex: 1 }}>{data.titles.get(e.id)}</Text>
              <Text variant="caption" tone="muted">
                {fmt.date(fromDayKey(e.day), { day: 'numeric', month: 'short' })} · {t(`slots.${e.slot}`)}
              </Text>
            </Row>
          ))}
        </>
      ) : (
        <EmptyState icon="restaurant-outline" title={t('history.noMeals')} message={t('history.noMealsHint')} />
      )}
    </Screen>
  );
}
