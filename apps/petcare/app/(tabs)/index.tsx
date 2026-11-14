import { Badge, Button, Card, EmptyState, FadeIn, ListRow, Row, Screen, SectionHeader, Stat, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { PetAvatar, StatusBadge } from '@/components/pet';
import { loadDashboard } from '@/features/dashboard/load';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { mutate } from '@/services/mutations';
import { repos } from '@/database';
import { usePreferences } from '@/store/preferences';

/** Home dashboard: everything due soon, across all pets. Browse screen (banner allowed). */
export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const unit = usePreferences((s) => s.weightUnit);
  const currency = usePreferences((s) => s.currency);
  const { data } = useData((r) => loadDashboard(r, clock.now()));
  const petName = (id: string) => data?.pets.find((p) => p.id === id)?.name ?? '';
  const hour = clock.now().getHours();
  const greeting = t(hour < 12 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening');

  if (data && data.pets.length === 0) {
    return (
      <Screen>
        <Text variant="title">{greeting}</Text>
        <EmptyState icon="paw-outline" title={t('home.noPetsTitle')} message={t('home.noPetsBody')} action={<Button label={t('pets.new')} icon="add" onPress={() => router.push('/pet/edit')} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FadeIn>
        <Text variant="title">{greeting}</Text>
        <Text tone="muted">{fmt.day(clock.today(), { dateStyle: 'full' })}</Text>
      </FadeIn>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {(data?.pets ?? []).map((p) => {
          const w = data?.latestWeights[p.id];
          return (
            <Pressable
              key={p.id}
              onPress={() => router.push(`/pet/${p.id}`)}
              accessibilityRole="button"
              accessibilityLabel={p.name}
              style={{ alignItems: 'center', gap: 4, width: 84 }}
              testID={`home-pet-${p.id}`}
            >
              <PetAvatar pet={p} size={64} />
              <Text variant="bodySmall" numberOfLines={1} style={{ fontWeight: '700' }}>
                {p.name}
              </Text>
              {w ? (
                <Text variant="caption" tone="subtle">
                  {fmt.weight(w.weightKg, unit)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
        <Pressable onPress={() => router.push('/pet/edit')} accessibilityRole="button" accessibilityLabel={t('pets.new')} style={{ alignItems: 'center', gap: 4, width: 84 }}>
          <Row style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.border, justifyContent: 'center' }}>
            <Text variant="title" tone="subtle">
              +
            </Text>
          </Row>
          <Text variant="caption" tone="muted">
            {t('common.add')}
          </Text>
        </Pressable>
      </ScrollView>

      <Card>
        <SectionHeader title={t('home.today')} />
        {data && data.today.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('home.nothingToday')}
          </Text>
        ) : (
          data?.today.map((item) => (
            <ListRow
              key={`${item.kind}-${item.id}-${item.time}`}
              icon={item.kind === 'treatment' ? 'bandage-outline' : item.kind === 'meal' ? 'restaurant-outline' : item.kind === 'vaccination' ? 'shield-checkmark-outline' : 'calendar-outline'}
              title={item.kind === 'meal' ? t('home.mealFor', { pet: petName(item.petId) }) : item.title}
              subtitle={[item.time, petName(item.petId), item.kind === 'meal' ? (t(`options.foodType.${item.title}`, { defaultValue: item.title }) as string) : null].filter(Boolean).join(' · ')}
              right={
                item.kind === 'treatment' ? (
                  <Button label={t('home.given')} size="md" variant="secondary" onPress={() => mutate(t, () => repos().logTreatmentDose(item.id))} />
                ) : item.kind === 'meal' ? (
                  <Button label={t('home.fed')} size="md" variant="secondary" onPress={() => mutate(t, () => repos().logMeal(item.petId, item.id))} />
                ) : undefined
              }
              onPress={() => router.push(`/record/${item.kind === 'meal' ? 'feeding' : item.kind}?id=${item.id}`)}
            />
          ))
        )}
      </Card>

      {data && data.vaccinationsDue.length > 0 ? (
        <Card>
          <SectionHeader title={t('home.vaccinationsDue')} action={t('common.seeAll')} onAction={() => router.push('/list/vaccination')} />
          {data.vaccinationsDue.slice(0, 4).map((v) => (
            <ListRow
              key={v.id}
              title={`${v.name} · ${petName(v.petId)}`}
              subtitle={v.days < 0 ? t('home.overdueBy', { count: -v.days }) : v.days === 0 ? t('home.dueToday') : t('home.dueIn', { count: v.days })}
              right={<StatusBadge status={v.status} />}
              onPress={() => router.push(`/record/vaccination?id=${v.id}`)}
            />
          ))}
        </Card>
      ) : null}

      <Card>
        <SectionHeader title={t('home.appointments')} action={t('common.seeAll')} onAction={() => router.push('/list/appointment')} />
        {data && data.upcomingAppointments.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('home.noAppointments')}
          </Text>
        ) : (
          data?.upcomingAppointments.map((a) => (
            <ListRow
              key={a.id}
              icon="calendar-outline"
              title={`${t(`options.appointmentType.${a.type}`)} · ${petName(a.petId)}`}
              subtitle={[fmt.dateTime(a.startsAt), a.provider].filter(Boolean).join(' · ')}
              onPress={() => router.push(`/record/appointment?id=${a.id}`)}
            />
          ))
        )}
      </Card>

      {data && data.activeTreatments.length > 0 ? (
        <Card>
          <SectionHeader title={t('home.activeTreatments')} action={t('common.seeAll')} onAction={() => router.push('/list/treatment')} />
          {data.activeTreatments.map((tr) => (
            <ListRow key={tr.id} icon="bandage-outline" title={tr.name} subtitle={[petName(tr.petId), tr.endDate ? t('records.treatment.until', { date: fmt.day(tr.endDate) }) : null].filter(Boolean).join(' · ')} onPress={() => router.push(`/record/treatment?id=${tr.id}`)} />
          ))}
        </Card>
      ) : null}

      {data && data.restock.length > 0 ? (
        <Card tone="accent" onPress={() => router.push('/list/food')}>
          <Text variant="subheading">{t('home.restock')}</Text>
          <Text variant="bodySmall">{data.restock.map((f) => f.name).join(', ')}</Text>
        </Card>
      ) : null}

      <Row gap={3}>
        <Stat icon="wallet-outline" value={data?.monthExpenses[0] ? fmt.money(data.monthExpenses[0].total, data.monthExpenses[0].currency) : fmt.money(0, currency)} label={t('home.monthExpenses')} />
        <Stat icon="paw-outline" tone="accent" value={String(data?.pets.length ?? 0)} label={t('home.pets')} />
      </Row>

      {data && data.recent.length > 0 ? (
        <Card>
          <SectionHeader title={t('home.recent')} />
          {data.recent.map((r) => (
            <ListRow
              key={`${r.kind}-${r.id}`}
              icon={r.kind === 'health' ? 'medkit-outline' : r.kind === 'weight' ? 'scale-outline' : 'walk-outline'}
              title={r.kind === 'activity' ? t(`options.activityType.${r.label}`) : r.kind === 'weight' ? fmt.weight(Number(r.label), unit) : r.label}
              subtitle={`${petName(r.petId)} · ${fmt.day(r.date)}`}
              right={<Badge label={t(`home.recentKind.${r.kind}`)} tone="neutral" />}
              onPress={() => router.push(`/record/${r.kind}?id=${r.id}`)}
            />
          ))}
        </Card>
      ) : null}
      <AdBanner />
    </Screen>
  );
}
