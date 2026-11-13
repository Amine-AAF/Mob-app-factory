import { Button, Card, EmptyState, FadeIn, Icon, ProgressBar, Row, Screen, SectionHeader, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AlertRow } from '@/components/AlertRow';
import { AdBanner, HScroll, InfoNote, ItemRow, StatusBadge, VehicleAvatar } from '@/components/ui';
import { repos } from '@/database';
import { useAsync, useFormat, useToday } from '@/hooks';
import { loadDashboard, type VehicleSummary } from '@/services/dashboard';
import { usePreferences } from '@/store/preferences';
import { diffDays } from '@/utils/dates';

function QuickAction({ icon, label, onPress, testID }: { icon: IconName; label: string; onPress: () => void; testID?: string }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, opacity: pressed ? 0.75 : 1 })}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text variant="caption" style={{ fontWeight: '700' }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function VehicleCard({ s, today }: { s: VehicleSummary; today: string }) {
  const { t } = useTranslation();
  const f = useFormat();
  const theme = useTheme();
  const next = s.nextMaintenance;
  const consumption = s.consumption.map((c) => f.consumption(c.per100km, c.unit)).filter(Boolean).join(' · ');
  return (
    <Card onPress={() => router.push(`/vehicle/${s.vehicle.id}`)} accessibilityLabel={s.vehicle.name} style={{ gap: 12 }}>
      <Row gap={3}>
        <VehicleAvatar vehicle={s.vehicle} size={52} />
        <View style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={1}>
            {s.vehicle.name}
          </Text>
          <Text variant="bodySmall" tone="muted" numberOfLines={1}>
            {[s.vehicle.make, s.vehicle.model, s.vehicle.year].filter(Boolean).join(' ')}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
      </Row>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" tone="subtle">
            {t('common.odometer')}
          </Text>
          <Text variant="subheading">{f.distance(s.odometer.knownKm)}</Text>
          {s.odometer.rate && s.odometer.estimatedKm !== null && s.odometer.knownKm !== null && s.odometer.estimatedKm - s.odometer.knownKm > 50 ? (
            <Text variant="caption" tone="subtle">
              {t('home.odometerEstimate', { distance: f.distance(s.odometer.estimatedKm) })}
            </Text>
          ) : null}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" tone="subtle">
            {t('home.monthSpend')}
          </Text>
          <Text variant="subheading" numberOfLines={2}>
            {f.totals(s.monthSpend, s.vehicle.currency, f.money(0, s.vehicle.currency))}
          </Text>
          {consumption ? (
            <Text variant="caption" tone="subtle">
              {consumption}
            </Text>
          ) : null}
        </View>
      </Row>
      <View style={{ gap: 4 }}>
        <Text variant="label" tone="subtle">
          {t('home.nextMaintenance')}
        </Text>
        {next ? (
          <Row gap={2} wrap>
            <Text variant="bodySmall" style={{ fontWeight: '600' }}>
              {next.schedule.title ?? t(`maintenanceTypes.${next.schedule.type}`)}
            </Text>
            <Text variant="caption" tone="muted">
              {next.due.nextDay ? `${f.day(next.due.nextDay)}${next.due.estimated ? ` (${t('common.estimated')})` : ''}` : next.due.dueKm !== null ? f.distance(next.due.dueKm) : ''}
            </Text>
            <StatusBadge status={next.due.status} />
          </Row>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('home.noSchedule')}
          </Text>
        )}
      </View>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" tone="subtle">
            {t('home.insurance')}
          </Text>
          {s.insurance ? (
            <>
              <Text variant="bodySmall">{t('insurance.expiresOn', { date: f.day(s.insurance.policy.endDay) })}</Text>
              <StatusBadge status={s.insurance.status} />
            </>
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('home.noInsurance')}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" tone="subtle">
            {t('home.inspection')}
          </Text>
          {s.inspection ? (
            <>
              <Text variant="bodySmall">{f.day(s.inspection.dueDay)}</Text>
              <Text variant="caption" tone={diffDays(today, s.inspection.dueDay) < 0 ? 'danger' : 'muted'}>
                {diffDays(today, s.inspection.dueDay) < 0 ? t('common.overdueBy', { count: -diffDays(today, s.inspection.dueDay) }) : t('common.daysLeft', { count: diffDays(today, s.inspection.dueDay) })}
              </Text>
            </>
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('home.noInspection')}
            </Text>
          )}
        </View>
      </Row>
    </Card>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const currency = usePreferences((s) => s.currency);
  const { data } = useAsync(() => loadDashboard(repos(), today), [today]);

  if (data && data.summaries.length === 0) {
    return (
      <Screen>
        <Text variant="title">{t('home.greeting')}</Text>
        <EmptyState icon="car-sport" title={t('home.noVehicleTitle')} message={t('home.noVehicleBody')} action={<Button label={t('home.addVehicle')} icon="add" onPress={() => router.push('/vehicle/edit')} testID="add-first-vehicle" />} />
      </Screen>
    );
  }

  const alerts = data?.summaries.flatMap((s) => s.alerts.map((a) => ({ a, name: s.vehicle.name }))) ?? [];
  const multi = (data?.summaries.length ?? 0) > 1;
  const recentFuel = (data?.summaries ?? []).flatMap((s) => s.recentFuel.map((fill) => ({ fill, vehicle: s.vehicle }))).sort((x, y) => (x.fill.day < y.fill.day ? 1 : -1)).slice(0, 3);

  return (
    <Screen>
      <Text variant="title">{t('home.greeting')}</Text>

      <Stack gap={2}>
        <Text variant="label" tone="muted">
          {t('home.quickActions')}
        </Text>
        <Row gap={2}>
          <QuickAction icon="speedometer" label={t('home.addFuel')} onPress={() => router.push('/fuel/edit')} testID="quick-fuel" />
          <QuickAction icon="wallet" label={t('home.addExpense')} onPress={() => router.push('/expense/edit')} testID="quick-expense" />
          <QuickAction icon="construct" label={t('home.addMaintenance')} onPress={() => router.push('/maintenance/edit')} />
          <QuickAction icon="analytics" label={t('home.updateOdometer')} onPress={() => router.push('/odometer')} />
        </Row>
      </Stack>

      <SectionHeader title={t('home.alerts')} />
      <Card>
        {alerts.length ? alerts.slice(0, 6).map(({ a, name }) => <AlertRow key={`${a.kind}-${a.refId}`} alert={a} today={today} vehicleName={multi ? name : undefined} />) : <InfoNote icon="checkmark-circle-outline" text={t('home.noAlerts')} />}
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('home.monthSpend')}</Text>
          <Pressable onPress={() => router.push('/budget')} accessibilityRole="button" hitSlop={8}>
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
              {t('home.budget')}
            </Text>
          </Pressable>
        </Row>
        <Text variant="title">{f.totals(data?.monthTotals ?? {}, currency, f.money(0, currency))}</Text>
        {data?.budget ? (
          <Stack gap={1}>
            <ProgressBar progress={Math.min(1, data.budget.ratio)} tone={data.budget.state === 'over' ? 'accent' : 'primary'} label={t('home.budget')} />
            <Text variant="caption" tone={data.budget.state === 'over' ? 'danger' : 'muted'}>
              {data.budget.state === 'over'
                ? t('home.budgetOver', { amount: f.money(data.budget.spentMinor - data.budget.budgetMinor, currency) })
                : t('home.budgetLeft', { amount: f.money(data.budget.budgetMinor - data.budget.spentMinor, currency) })}
            </Text>
            {data.budget.otherCurrencies.length ? (
              <Text variant="caption" tone="subtle">
                {t('home.otherCurrencies', { list: data.budget.otherCurrencies.join(', ') })}
              </Text>
            ) : null}
          </Stack>
        ) : null}
      </Card>

      {(data?.summaries ?? []).map((s, i) => (
        <FadeIn key={s.vehicle.id} delay={i * 60}>
          <VehicleCard s={s} today={today} />
        </FadeIn>
      ))}

      <SectionHeader title={t('home.recentFuel')} action={recentFuel.length ? t('common.seeAll') : undefined} onAction={() => recentFuel[0] && router.push(`/vehicle/${recentFuel[0].vehicle.id}/fuel`)} />
      <Card>
        {recentFuel.length ? (
          recentFuel.map(({ fill, vehicle }) => (
            <ItemRow
              key={fill.id}
              icon={fill.quantityUnit === 'kWh' ? 'flash' : 'speedometer'}
              title={`${f.quantity(fill.quantity, fill.quantityUnit)}${fill.isFull ? '' : ` · ${t('fuel.partial')}`}`}
              subtitle={[f.day(fill.day), multi ? vehicle.name : null, fill.station].filter(Boolean).join(' · ')}
              value={f.money(fill.totalMinor, fill.currency)}
              onPress={() => router.push({ pathname: '/fuel/edit', params: { id: fill.id } })}
            />
          ))
        ) : (
          <InfoNote text={t('home.noFuel')} />
        )}
      </Card>

      {multi ? (
        <HScroll>
          <Button label={t('compare.title')} icon="git-compare-outline" variant="secondary" size="md" onPress={() => router.push('/compare')} />
          <Button label={t('reports.title')} icon="document-text-outline" variant="secondary" size="md" onPress={() => router.push('/reports')} />
        </HScroll>
      ) : null}

      <AdBanner screen="home" />
    </Screen>
  );
}
