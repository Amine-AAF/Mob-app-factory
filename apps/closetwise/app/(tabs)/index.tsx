import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { ItemPhoto } from '@/components/ItemPhoto';
import { OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { tripNights } from '@/domain/packing';
import { loadHome, type HomeData } from '@/features/home/loadHome';
import { daysUntil, greetingPeriod } from '@/features/home/logic';
import { useLimitedAdd } from '@/features/home/useLimitedAdd';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { Button, Card, FadeIn, Icon, Loading, PageHeader, PressableScale, ProgressBar, Row, Screen, SectionHeader, Stack, Stat, Text, useTheme, type IconName } from '@/ui';

export default function HomeScreen() {
  const { t } = useTranslation();
  const today = clock.today();
  const { data, error } = useAsync(() => loadHome(repos(), today), [today]);
  const period = greetingPeriod(clock.now().getHours());
  const greeting = period === 'morning' ? t('home.greeting.morning') : period === 'afternoon' ? t('home.greeting.afternoon') : t('home.greeting.evening');

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <PageHeader eyebrow={fmt.day(today, { weekday: 'long', day: 'numeric', month: 'long' })} title={greeting} subtitle={data && data.itemCount > 0 ? t('home.subtitle') : undefined} />
        {!data ? error ? <Text tone="danger">{t('common.error')}</Text> : <Loading /> : data.itemCount === 0 ? <FirstRun /> : <HomeContent data={data} today={today} />}
      </Screen>
      <AdBanner screen="home" />
    </View>
  );
}

function FirstRun() {
  const { t } = useTranslation();
  const theme = useTheme();
  const add = useLimitedAdd();
  return (
    <FadeIn>
      <Card tone="alt" style={{ paddingVertical: theme.spacing(8), alignItems: 'center', gap: theme.spacing(3) }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="shirt-outline" size={36} color={theme.colors.text} />
        </View>
        <Text variant="title" center>
          {t('home.firstRun.title')}
        </Text>
        <Text tone="muted" center>
          {t('home.firstRun.message')}
        </Text>
        <Button label={t('home.firstRun.cta')} icon="camera-outline" onPress={() => void add('items')} testID="home-first-item" />
        <Row gap={2} style={{ paddingHorizontal: theme.spacing(2) }}>
          <Icon name="lock-closed-outline" size={14} color={theme.colors.textSubtle} />
          <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
            {t('home.firstRun.privacy')}
          </Text>
        </Row>
      </Card>
    </FadeIn>
  );
}

function HomeContent({ data, today }: { data: HomeData; today: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const add = useLimitedAdd();
  return (
    <>
      <FadeIn>
        <TodayCard data={data} today={today} />
      </FadeIn>

      <Row gap={2} style={{ justifyContent: 'space-between' }}>
        <QuickAction icon="add-circle-outline" label={t('home.actions.addItem')} onPress={() => void add('items')} />
        <QuickAction icon="layers-outline" label={t('home.actions.newOutfit')} onPress={() => void add('outfits')} />
        <QuickAction icon="bulb-outline" label={t('home.actions.ideas')} onPress={() => router.push('/suggestions')} />
        <QuickAction icon="calendar-outline" label={t('home.actions.planWeek')} onPress={() => router.navigate('/(tabs)/calendar')} />
      </Row>

      <SectionHeader title={t('home.snapshot.title')} action={t('home.snapshot.insights')} onAction={() => router.push('/insights')} />
      <Row gap={2}>
        <Stat value={fmt.number(data.itemCount)} label={t('home.snapshot.items')} icon="shirt-outline" />
        <Stat value={fmt.number(data.outfitCount)} label={t('home.snapshot.outfits')} icon="layers-outline" />
        <Stat value={fmt.number(data.worn)} label={t('home.snapshot.wornThisMonth')} icon="sparkles-outline" />
      </Row>

      {data.care > 0 ? (
        <Card onPress={() => router.push('/care')} accessibilityLabel={t('home.care.title', { count: data.care })}>
          <Row>
            <Icon name="water-outline" size={20} color={theme.colors.textMuted} />
            <Stack gap={0.5} style={{ flex: 1 }}>
              <Text variant="heading">{t('home.care.title', { count: data.care })}</Text>
              <Text variant="bodySmall" tone="muted">
                {t('home.care.message')}
              </Text>
            </Stack>
            <Icon name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Row>
        </Card>
      ) : null}

      {data.trip ? <TripCard trip={data.trip} today={today} /> : null}

      {data.activeGoals.length > 0 ? (
        <Card onPress={() => router.push('/goals')} accessibilityLabel={t('home.goals.title')}>
          <Row>
            <Icon name="flag-outline" size={20} color={theme.colors.textMuted} />
            <Stack gap={0.5} style={{ flex: 1 }}>
              <Text variant="heading">{t('home.goals.active', { count: data.activeGoals.length })}</Text>
              <Text variant="bodySmall" tone="muted" numberOfLines={2}>
                {data.activeGoals
                  .slice(0, 3)
                  .map((g) => g.title || t(`catalog.goal.${g.kind}`))
                  .join(' · ')}
              </Text>
            </Stack>
            <Icon name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </Row>
        </Card>
      ) : null}

      {data.rediscover.length > 0 ? <Rediscover data={data} /> : null}
    </>
  );
}

function TodayCard({ data, today }: { data: HomeData; today: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const plan = data.todayPlans.find((p) => p.outfit) ?? data.todayPlans[0];
  const openPlan = () => router.push({ pathname: '/plan/[date]', params: { date: today } });
  if (!plan) {
    return (
      <Card tone="accent" style={{ gap: theme.spacing(3) }}>
        <Text variant="label" tone="subtle">
          {t('home.today.eyebrow')}
        </Text>
        <Text variant="title">{t('home.today.emptyTitle')}</Text>
        <Text tone="muted">{t('home.today.emptyMessage')}</Text>
        <Row gap={2} wrap>
          <Button small label={t('home.today.plan')} icon="calendar-outline" onPress={openPlan} />
          <Button small variant="secondary" label={t('home.today.ideas')} icon="bulb-outline" onPress={() => router.push('/suggestions')} />
        </Row>
      </Card>
    );
  }
  const more = data.todayPlans.length - 1;
  return (
    <Card onPress={openPlan} accessibilityLabel={t('home.today.open')} style={{ gap: theme.spacing(3) }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="subtle">
          {t('home.today.eyebrow')}
        </Text>
        {plan.schedule.wornLogged ? <Text variant="caption" tone="success">{t('home.today.worn')}</Text> : null}
      </Row>
      {plan.outfit ? (
        <>
          <OutfitCollage refs={plan.outfit.items} items={data.itemMap} height={240} />
          <Text variant="title" numberOfLines={1}>
            {plan.outfit.name}
          </Text>
        </>
      ) : (
        <Text tone="muted">{plan.schedule.notes || t('home.today.noOutfit')}</Text>
      )}
      {more > 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('home.today.more', { count: more })}
        </Text>
      ) : null}
    </Card>
  );
}

function TripCard({ trip, today }: { trip: NonNullable<HomeData['trip']>; today: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const days = daysUntil(trip.trip.departureDate, today);
  const nights = tripNights(trip.trip);
  return (
    <Card onPress={() => router.push({ pathname: '/trips/[id]', params: { id: trip.trip.id } })} accessibilityLabel={trip.trip.destination}>
      <Row>
        <Icon name="airplane-outline" size={20} color={theme.colors.textMuted} />
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text variant="label" tone="subtle">
            {days === 0 ? t('home.trip.now') : t('home.trip.inDays', { count: days })}
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {trip.trip.destination}
          </Text>
          <Text variant="bodySmall" tone="muted">
            {`${fmt.day(trip.trip.departureDate, { day: 'numeric', month: 'short' })} – ${fmt.day(trip.trip.returnDate, { day: 'numeric', month: 'short' })} · ${t('trips.nights', { count: nights })}`}
          </Text>
        </Stack>
        <Icon name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Row>
      {trip.progress.total > 0 ? (
        <Stack gap={1}>
          <ProgressBar progress={trip.progress.ratio} tone="accent" label={t('trips.progress', { packed: trip.progress.packed, total: trip.progress.total })} />
          <Text variant="caption" tone="subtle">
            {t('trips.progress', { packed: trip.progress.packed, total: trip.progress.total })}
          </Text>
        </Stack>
      ) : (
        <Text variant="caption" tone="subtle">
          {t('home.trip.startPacking')}
        </Text>
      )}
    </Card>
  );
}

function Rediscover({ data }: { data: HomeData }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  return (
    <Stack gap={2}>
      <SectionHeader title={t('home.rediscover.title')} />
      <Text variant="bodySmall" tone="muted">
        {t('home.rediscover.message')}
      </Text>
      <FlatList
        horizontal
        data={data.rediscover}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing(2) }}
        renderItem={({ item }) => (
          <PressableScale onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })} accessibilityRole="button" accessibilityLabel={item.name} style={{ width: 96 }}>
            <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} />
            <Text variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>
              {item.name}
            </Text>
          </PressableScale>
        )}
      />
    </Stack>
  );
}

function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ flex: 1, alignItems: 'center', gap: theme.spacing(1.5), minHeight: 72 }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color={theme.colors.text} />
      </View>
      <Text variant="caption" center numberOfLines={2}>
        {label}
      </Text>
    </PressableScale>
  );
}
