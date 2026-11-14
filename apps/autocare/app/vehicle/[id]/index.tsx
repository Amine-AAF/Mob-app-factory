import { Card, EmptyState, Icon, IconButton, Row, Screen, SectionHeader, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AlertRow } from '@/components/AlertRow';
import { InfoNote, VehicleAvatar } from '@/components/ui';
import { costPerKm, toCostEntries, totals } from '@/features/expenses/aggregate';
import { currenciesOf } from '@/features/money/money';
import { distanceBetween } from '@/features/odometer/mileage';
import { useFormat, useToday } from '@/hooks';
import { useVehicleBundle } from '@/hooks/data';
import { summarize } from '@/services/dashboard';
import { usePreferences } from '@/store/preferences';

const SECTIONS: { key: string; route: string; icon: IconName }[] = [
  { key: 'maintenance', route: 'maintenance', icon: 'construct' },
  { key: 'fuel', route: 'fuel', icon: 'speedometer' },
  { key: 'expenses', route: 'expenses', icon: 'wallet' },
  { key: 'insurance', route: 'insurance', icon: 'shield-checkmark' },
  { key: 'deadlines', route: 'deadlines', icon: 'calendar' },
  { key: 'documents', route: 'documents', icon: 'folder-open' },
  { key: 'tires', route: 'tires', icon: 'ellipse' },
  { key: 'odometer', route: 'odometer', icon: 'analytics' },
  { key: 'inspections', route: 'inspections', icon: 'checkbox' },
  { key: 'notes', route: 'notes', icon: 'create' },
];

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ width: '31%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, opacity: pressed ? 0.75 : 1 })}>
      <Icon name={icon} size={22} color={theme.colors.primary} />
      <Text variant="caption" center style={{ fontWeight: '700' }} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function VehicleOverview() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bundle, loading } = useVehicleBundle(id);

  if (!loading && !bundle) return <EmptyState icon="car-outline" title={t('vehicle.missing')} />;
  if (!bundle) return null;
  const v = bundle.vehicle;
  const s = summarize(bundle, today);
  const entries = toCostEntries(bundle);
  const all = totals(entries);
  const firstDay = bundle.readings[0]?.day ?? v.purchaseDate ?? today;
  const distance = distanceBetween(bundle.readings, firstDay, today);
  const perKm = costPerKm(all, distance);

  return (
    <>
      <RouterStack.Screen options={{ title: v.name, headerRight: () => <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/vehicle/edit', params: { id: v.id } })} /> }} />
      <Screen edges={[]}>
        <Card>
          <Row gap={3}>
            <VehicleAvatar vehicle={v} size={72} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="heading">{[v.make, v.model].filter(Boolean).join(' ') || v.name}</Text>
              <Text variant="bodySmall" tone="muted">
                {[v.trim, v.year, v.engine].filter(Boolean).join(' · ')}
              </Text>
              <Text variant="caption" tone="subtle">
                {[t(`fuelTypes.${v.fuelType}`), v.transmission ? t(`transmissions.${v.transmission}`) : null, v.powerHp ? `${f.number(v.powerHp)} hp` : null, v.plate].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </Row>
          <Row gap={3} style={{ marginTop: 8, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="label" tone="subtle">
                {t('common.odometer')}
              </Text>
              <Text variant="subheading">{f.distance(s.odometer.knownKm)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label" tone="subtle">
                {t('vehicle.costSoFar')}
              </Text>
              <Text variant="subheading" numberOfLines={2}>
                {f.totals(all, v.currency)}
              </Text>
            </View>
          </Row>
          <Row gap={3} style={{ alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="label" tone="subtle">
                {t('vehicle.costPerDistance', { unit: f.distanceUnit })}
              </Text>
              <Text variant="bodySmall">{perKm ? currenciesOf(all, v.currency).map((c) => f.costPerDistance(perKm[c] ?? 0, c)).join(' + ') : '—'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="label" tone="subtle">
                {t('vehicle.avgConsumption')}
              </Text>
              <Text variant="bodySmall">{s.consumption.map((c) => f.consumption(c.per100km, c.unit)).filter(Boolean).join(' · ') || '—'}</Text>
            </View>
          </Row>
        </Card>

        {s.alerts.length ? (
          <>
            <SectionHeader title={t('home.alerts')} />
            <Card>
              {s.alerts.map((a) => (
                <AlertRow key={`${a.kind}-${a.refId}`} alert={a} today={today} />
              ))}
            </Card>
          </>
        ) : null}

        <SectionHeader title={t('vehicle.sections')} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SECTIONS.map((sec) => (
            <Tile key={sec.key} icon={sec.icon} label={t(`sections.${sec.key}`)} onPress={() => router.push(`/vehicle/${v.id}/${sec.route}` as never)} />
          ))}
          <Tile
            icon="document-text"
            label={t('sections.reports')}
            onPress={() => {
              usePreferences.getState().set({ activeVehicleId: v.id });
              router.push('/reports');
            }}
          />
        </View>
        {v.notes ? <InfoNote icon="create-outline" text={v.notes} /> : null}
      </Screen>
    </>
  );
}
