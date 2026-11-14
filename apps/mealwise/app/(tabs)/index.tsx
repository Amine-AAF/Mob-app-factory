import { addDays, fromDayKey } from '@factory/app-core';
import { Badge, Button, Card, EmptyState, Icon, ProgressBar, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AdBanner, RecipeCard } from '@/components/cards';
import { RecipeArt, Shortcut } from '@/components/ui';
import { repos } from '@/database';
import { listProgress } from '@/domain/grocery';
import { expiringItems } from '@/domain/pantry';
import { nextMeal, summarizeWeek, weekStart } from '@/domain/planner';
import { MEAL_SLOTS, type PlanEntry, type Recipe } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { builtinRecipes, recipesById } from '@/services/recipeCatalog';
import { usePreferences } from '@/store/preferences';

function greetingKey(hour: number): string {
  if (hour < 12) return 'home.morning';
  if (hour < 18) return 'home.afternoon';
  return 'home.evening';
}

export default function Home() {
  const { t, lng } = useLang();
  const theme = useTheme();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const today = clock.today();
  const start = weekStart(today, firstDay);

  const { data } = useAsync(async () => {
    const r = repos();
    const week = await r.plan.week(start);
    const upcoming = await r.plan.range(today, addDays(today, 1));
    const ids = [...week, ...upcoming].filter((e) => e.recipeId).map((e) => e.recipeId as string);
    const favIds = await r.recipes.favoriteIds();
    const recipes = await recipesById([...ids, ...favIds.slice(0, 6)], lng);
    const list = await r.grocery.active();
    const items = list ? await r.grocery.items(list.id) : [];
    const pantry = await r.pantry.active();
    return {
      week,
      todays: week.filter((e) => e.day === today),
      next: nextMeal(upcoming, clock.now()),
      recipes,
      favorites: favIds.map((id) => recipes.get(id)).filter((x): x is Recipe => !!x).slice(0, 6),
      list,
      progress: listProgress(items),
      expiring: expiringItems(pantry, today),
    };
  }, [start, today, lng]);

  const title = (e: PlanEntry) => (e.recipeId ? data?.recipes.get(e.recipeId)?.title : null) ?? e.customTitle ?? '';
  const summary = data ? summarizeWeek(data.week, start) : null;

  return (
    <Screen testID="home-screen">
      <Stack gap={1}>
        <Text variant="caption" tone="muted">
          {fmt.dayLong(clock.now())}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {t(greetingKey(clock.now().getHours()))}
        </Text>
      </Stack>

      {data?.next ? (
        <Card tone="primary" onPress={() => router.push({ pathname: '/plan/entry', params: { id: String(data.next?.id) } })} accessibilityLabel={`${t('home.nextMeal')}: ${title(data.next)}`} testID="next-meal">
          <Row gap={3}>
            {data.next.recipeId && data.recipes.get(data.next.recipeId) ? (
              <RecipeArt emoji={data.recipes.get(data.next.recipeId)!.emoji} color={data.recipes.get(data.next.recipeId)!.color} size={56} />
            ) : (
              <RecipeArt emoji="🍽️" color="peach" size={56} />
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="label" tone="primary">
                {t('home.nextMeal')} · {data.next.day === today ? t('common.today') : t('common.tomorrow')} · {t(`slots.${data.next.slot}`)}
              </Text>
              <Text variant="heading" numberOfLines={2}>
                {title(data.next)}
              </Text>
            </View>
            {data.next.recipeId ? (
              <Button label={t('cook.start')} size="md" icon="flame" onPress={() => router.push({ pathname: '/cook/[id]', params: { id: data.next!.recipeId!, servings: String(data.next!.servings), entry: String(data.next!.id) } })} />
            ) : null}
          </Row>
        </Card>
      ) : null}

      <SectionHeader title={t('home.today')} action={t('home.openPlanner')} onAction={() => router.push('/(tabs)/planner')} />
      <Card>
        {MEAL_SLOTS.map((slot) => {
          const entries = data?.todays.filter((e) => e.slot === slot) ?? [];
          return (
            <Row key={slot} gap={3} style={{ minHeight: 44 }}>
              <Text variant="caption" tone="muted" style={{ width: 92 }}>
                {t(`slots.${slot}`)}
              </Text>
              {entries.length ? (
                <Text variant="body" style={{ flex: 1 }} numberOfLines={2} onPress={() => router.push({ pathname: '/plan/entry', params: { id: String(entries[0]!.id) } })}>
                  {entries.map(title).join(' · ')}
                </Text>
              ) : (
                <Text
                  variant="bodySmall"
                  tone="primary"
                  style={{ flex: 1, fontWeight: '600' }}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/plan/add', params: { day: today, slot } })}
                >
                  + {t('planner.addMeal')}
                </Text>
              )}
            </Row>
          );
        })}
      </Card>

      <Row gap={2}>
        <Shortcut icon="calendar" label={t('home.planWeek')} onPress={() => router.push('/(tabs)/planner')} testID="shortcut-planner" />
        <Shortcut icon="file-tray-full" label={t('pantry.title')} onPress={() => router.push('/pantry')} tone="accent" testID="shortcut-pantry" />
        <Shortcut icon="albums" label={t('templates.title')} onPress={() => router.push('/templates')} testID="shortcut-templates" />
        <Shortcut icon="add-circle" label={t('recipes.new')} onPress={() => router.push('/recipe/edit')} tone="accent" testID="shortcut-new-recipe" />
      </Row>

      {summary ? (
        <Card onPress={() => router.push('/(tabs)/planner')} accessibilityLabel={t('home.weekSummary')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('home.weekSummary')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('home.mealsPlanned', { count: summary.planned })}
            </Text>
          </Row>
          <ProgressBar progress={summary.filledMainSlots / summary.mainSlots} label={t('home.weekFilled')} />
          <Row style={{ justifyContent: 'space-between' }}>
            {Object.entries(summary.perDay).map(([day, n]) => (
              <View key={day} style={{ alignItems: 'center', gap: 4, flex: 1 }}>
                <Text variant="caption" tone={day === today ? 'primary' : 'muted'}>
                  {fmt.weekday(fromDayKey(day))}
                </Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: n > 0 ? theme.colors.accent : theme.colors.border }} />
              </View>
            ))}
          </Row>
        </Card>
      ) : null}

      <Card onPress={() => router.push('/(tabs)/grocery')} accessibilityLabel={t('home.groceryToDo')}>
        <Row gap={3}>
          <Icon name="cart" size={22} color={theme.colors.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="subheading">{t('home.groceryToDo')}</Text>
            {data?.list ? (
              <Text variant="bodySmall" tone="muted">
                {t('grocery.progress', { done: data.progress.done, total: data.progress.total })}
              </Text>
            ) : (
              <Text variant="bodySmall" tone="muted">
                {t('home.noList')}
              </Text>
            )}
          </View>
          <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </Row>
        {data?.list ? <ProgressBar progress={data.progress.ratio} tone="success" /> : null}
      </Card>

      {data?.expiring.length ? (
        <Card tone="alt" onPress={() => router.push('/pantry')} accessibilityLabel={t('home.expiringSoon')}>
          <Row gap={2}>
            <Icon name="alert-circle" size={20} color={theme.colors.warning} />
            <Text variant="subheading" style={{ flex: 1 }}>
              {t('home.expiringSoon')}
            </Text>
            <Badge label={String(data.expiring.length)} tone="warning" />
          </Row>
          <Text variant="bodySmall" tone="muted" numberOfLines={2}>
            {data.expiring.map((p) => p.name).join(', ')}
          </Text>
        </Card>
      ) : null}

      <SectionHeader title={t('home.favorites')} action={t('home.allRecipes')} onAction={() => router.push('/(tabs)/recipes')} />
      {data?.favorites.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {data.favorites.map((r) => (
            <Card key={r.id} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })} style={{ width: 150 }} accessibilityLabel={r.title}>
              <RecipeArt emoji={r.emoji} color={r.color} size={118} radius={16} />
              <Text variant="bodySmall" style={{ fontWeight: '600' }} numberOfLines={2}>
                {r.title}
              </Text>
            </Card>
          ))}
        </ScrollView>
      ) : (
        <EmptyState icon="heart-outline" title={t('home.noFavorites')} message={t('home.noFavoritesHint')} />
      )}

      {data && data.week.length === 0 ? (
        <Card tone="accent">
          <Text variant="subheading">{t('home.emptyWeekTitle')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('home.emptyWeekBody')}
          </Text>
          <Button label={t('templates.browse')} icon="albums-outline" size="md" onPress={() => router.push('/templates')} />
        </Card>
      ) : null}

      {/* Suggestions keep the dashboard useful on day one. */}
      <Suggestions />
      <AdBanner screen="home" />
    </Screen>
  );
}

function Suggestions() {
  const { t, lng } = useLang();
  const diet = usePreferences((s) => s.diet);
  const { data } = useAsync(async () => {
    const list = builtinRecipes(lng).filter((r) => !r.premium && (diet === 'none' || r.categories.includes(diet)) && r.categories.includes('quick'));
    // Rotate daily so the dashboard feels alive without randomness on every render.
    const seed = Number(clock.today().replace(/-/g, '')) % Math.max(1, list.length);
    return [...list.slice(seed), ...list.slice(0, seed)].slice(0, 3);
  }, [lng, diet]);
  if (!data?.length) return null;
  return (
    <Stack gap={3}>
      <SectionHeader title={t('home.quickIdeas')} />
      {data.map((r) => (
        <RecipeCard key={r.id} recipe={r} compact />
      ))}
    </Stack>
  );
}
