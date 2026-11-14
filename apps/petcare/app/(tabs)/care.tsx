import { Button, Card, ListRow, ProgressBar, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AdBanner } from '@/components/AdBanner';
import { PetAvatar, StatusBadge } from '@/components/pet';
import { repos } from '@/database';
import { goalProgress, needsRestock, stockLevel, summarizeDay } from '@/domain/care';
import { useData } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { mutate } from '@/services/mutations';

/** Daily care: walks & goals, meals, food stock, routines. Browse screen (banner allowed). */
export default function Care() {
  const { t } = useTranslation();
  const today = clock.today();
  const { data } = useData(async (r) => ({
    pets: await r.pets.listActive(),
    activities: await r.activities.all(),
    feeding: (await r.feeding.all()).filter((f) => f.active),
    food: await r.food.all(),
    checklists: await r.checklists.list(),
  }));
  const pets = data?.pets ?? [];
  const petName = (id: string | null) => pets.find((p) => p.id === id)?.name ?? '';

  return (
    <Screen>
      <Text variant="title">{t('tabs.care')}</Text>
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          <Button label={t('care.logActivity')} icon="walk-outline" size="md" onPress={() => router.push('/record/activity')} testID="care-add-activity" />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <Button label={t('care.addExpense')} icon="wallet-outline" size="md" variant="secondary" onPress={() => router.push('/record/expense')} />
        </Stack>
      </Row>

      <Card>
        <SectionHeader title={t('care.todayActivity')} action={t('common.seeAll')} onAction={() => router.push('/list/activity')} />
        {pets.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('home.noPetsBody')}
          </Text>
        ) : (
          pets.map((p) => {
            const walk = summarizeDay(data?.activities.filter((a) => a.petId === p.id) ?? [], today, p.species === 'dog' ? 'walk' : undefined);
            const goal = p.species === 'dog' ? goalProgress(walk.minutes, p.walkGoalMinutes) : null;
            return (
              <Stack key={p.id} gap={2} style={{ paddingVertical: 6 }}>
                <Row gap={3}>
                  <PetAvatar pet={p} size={36} />
                  <Stack gap={0} style={{ flex: 1 }}>
                    <Text variant="subheading">{p.name}</Text>
                    <Text variant="caption" tone="muted">
                      {p.species === 'dog' ? t('care.walkSummary', { minutes: walk.minutes, count: walk.count }) : t('care.activitySummary', { count: walk.count, minutes: walk.minutes })}
                    </Text>
                  </Stack>
                  <Button label={t('common.add')} size="md" variant="ghost" onPress={() => router.push(`/record/activity?petId=${p.id}`)} />
                </Row>
                {goal != null ? <ProgressBar progress={goal} tone="accent" label={t('care.walkGoal', { goal: p.walkGoalMinutes })} /> : null}
              </Stack>
            );
          })
        )}
      </Card>

      <Card>
        <SectionHeader title={t('care.meals')} action={t('common.seeAll')} onAction={() => router.push('/list/feeding')} />
        {(data?.feeding ?? []).length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('lists.empty.feeding')}
          </Text>
        ) : (
          data!.feeding.map((f) => (
            <ListRow
              key={f.id}
              icon="restaurant-outline"
              title={`${petName(f.petId)} · ${[f.brand, f.product].filter(Boolean).join(' ') || t(`options.foodType.${f.foodType}`)}`}
              subtitle={[f.quantity, f.mealTimes.join(', ')].filter(Boolean).join(' · ')}
              right={<Button label={t('home.fed')} size="md" variant="secondary" onPress={() => mutate(t, () => repos().logMeal(f.petId, f.id))} />}
              onPress={() => router.push(`/record/feeding?id=${f.id}`)}
            />
          ))
        )}
        <Button label={t('records.feeding.new')} variant="ghost" size="md" icon="add" onPress={() => router.push('/record/feeding')} />
      </Card>

      <Card>
        <SectionHeader title={t('care.inventory')} action={t('common.seeAll')} onAction={() => router.push('/list/food')} />
        {(data?.food ?? []).length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('lists.empty.food')}
          </Text>
        ) : (
          [...data!.food]
            .sort((a, b) => Number(needsRestock(b)) - Number(needsRestock(a)))
            .slice(0, 5)
            .map((f) => <ListRow key={f.id} icon="cube-outline" title={f.name} subtitle={petName(f.petId) || undefined} right={<StatusBadge status={stockLevel(f)} />} onPress={() => router.push(`/record/food?id=${f.id}`)} />)
        )}
        <Button label={t('records.food.new')} variant="ghost" size="md" icon="add" onPress={() => router.push('/record/food')} />
      </Card>

      <Card onPress={() => router.push('/templates')} accessibilityLabel={t('templates.title')}>
        <Text variant="subheading">{t('templates.title')}</Text>
        <Text variant="bodySmall" tone="muted">
          {data && data.checklists.length > 0 ? t('templates.inProgress', { count: data.checklists.length }) : t('templates.subtitle')}
        </Text>
      </Card>
      <Card onPress={() => router.push('/expenses')} accessibilityLabel={t('expenses.stats')}>
        <Text variant="subheading">{t('expenses.stats')}</Text>
        <Text variant="bodySmall" tone="muted">
          {t('expenses.subtitle')}
        </Text>
      </Card>
      <AdBanner />
    </Screen>
  );
}
