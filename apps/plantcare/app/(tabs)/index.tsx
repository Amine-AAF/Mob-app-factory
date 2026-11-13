import { Button, Card, EmptyState, FadeIn, Icon, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { TaskRow } from '@/components/care';
import { useLeaf } from '@/components/leaf';
import { PlantCard } from '@/components/PlantCard';
import { useData } from '@/hooks/useData';
import { buildAgenda } from '@/domain/schedule';
import { currentSeason } from '@/domain/seasons';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = useLeaf();
  const router = useRouter();
  const climate = usePreferences((s) => s.climate);
  const today = clock.today();

  const { data } = useData(async (r) => {
    const [plants, tasks, health] = await Promise.all([r.plants.list({}, 'next_care'), r.tasks.listActive(), r.health.open()]);
    return { plants, tasks, health };
  });

  const plants = data?.plants ?? [];
  const byId = new Map(plants.map((p) => [p.id, p]));
  const agenda = buildAgenda(data?.tasks ?? [], today, 7);
  const dueNow = [...agenda.overdue, ...agenda.today];
  const attention = [...new Set((data?.health ?? []).map((h) => h.plantId))].map((id) => byId.get(id)).filter(Boolean);
  const season = currentSeason(today, climate);
  const hour = clock.now().getHours();
  const greeting = hour < 12 ? t('home.morning') : hour < 18 ? t('home.afternoon') : t('home.evening');

  return (
    <Screen testID="home-screen">
      <FadeIn>
        <View style={{ borderRadius: theme.radius.xl, padding: 20, backgroundColor: tokens.mint, gap: 6, overflow: 'hidden' }}>
          <Icon name="leaf" size={120} color={tokens.sage} style={{ position: 'absolute', right: -20, top: -20, transform: [{ rotate: '-20deg' }] }} />
          <Text variant="caption" tone="muted" style={{ textTransform: 'capitalize' }}>
            {fmt.day(today, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text variant="title">{greeting}</Text>
          <Text tone="muted">
            {plants.length === 0
              ? t('home.noPlantsYet')
              : dueNow.length === 0
                ? t('home.allGood')
                : t('home.tasksToday', { count: dueNow.length })}
          </Text>
        </View>
      </FadeIn>

      {plants.length === 0 && data ? (
        <EmptyState
          icon="leaf-outline"
          title={t('home.emptyTitle')}
          message={t('home.emptyBody')}
          action={
            <Stack gap={2} style={{ alignSelf: 'stretch' }}>
              <Button label={t('plants.add')} icon="add" onPress={() => router.push('/plant/edit')} testID="home-add-plant" />
              <Button label={t('home.browseLibrary')} variant="secondary" icon="library-outline" onPress={() => router.push('/(tabs)/library')} />
            </Stack>
          }
        />
      ) : (
        <>
          <Row gap={2}>
            <Stat value={String(plants.length)} label={t('home.statPlants')} icon="leaf-outline" />
            <Stat value={String(dueNow.length)} label={t('home.statToday')} icon="water-outline" tone="accent" />
            <Stat value={String(agenda.overdue.length)} label={t('home.statOverdue')} icon="alert-circle-outline" tone="warning" />
          </Row>

          <SectionHeader title={t('home.careToday')} action={t('home.seeCalendar')} onAction={() => router.push('/(tabs)/calendar')} />
          {dueNow.length === 0 ? (
            <Card tone="primary">
              <Row gap={2}>
                <Icon name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={{ flex: 1 }}>{t('home.nothingDue')}</Text>
              </Row>
            </Card>
          ) : (
            <Stack gap={2}>
              {dueNow.map((task) => (
                <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
              ))}
            </Stack>
          )}

          {agenda.upcoming.length > 0 ? (
            <>
              <SectionHeader title={t('home.comingUp')} />
              <Stack gap={2}>
                {agenda.upcoming.slice(0, 4).map((task) => (
                  <TaskRow key={task.id} task={task} plant={byId.get(task.plantId)} />
                ))}
              </Stack>
            </>
          ) : null}

          {attention.length > 0 ? (
            <>
              <SectionHeader title={t('home.needsAttention')} />
              <Row wrap gap={3}>
                {attention.slice(0, 4).map((p) => (
                  <PlantCard key={p!.id} plant={p!} />
                ))}
              </Row>
            </>
          ) : null}

          <SectionHeader title={t('home.shortcuts')} />
          <Row wrap gap={2}>
            <Button size="md" variant="secondary" icon="add" label={t('plants.add')} onPress={() => router.push('/plant/edit')} />
            <Button size="md" variant="secondary" icon="grid-outline" label={t('garden.title')} onPress={() => router.push('/garden')} />
            <Button size="md" variant="secondary" icon="stats-chart-outline" label={t('stats.title')} onPress={() => router.push('/stats')} />
            <Button size="md" variant="secondary" icon="heart-outline" label={t('wishlist.title')} onPress={() => router.push('/wishlist')} />
          </Row>

          <Card onPress={() => router.push('/seasonal')} tone="alt" accessibilityLabel={t('seasonal.title')}>
            <Row gap={3}>
              <Icon name="partly-sunny-outline" size={24} color={theme.colors.accent} />
              <View style={{ flex: 1 }}>
                <Text variant="subheading">{season ? t('seasonal.currentCard', { season: t(`seasons.${season}`) }) : t('seasonal.title')}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t('seasonal.cardBody')}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
          </Card>
        </>
      )}
      <AdBanner />
    </Screen>
  );
}
