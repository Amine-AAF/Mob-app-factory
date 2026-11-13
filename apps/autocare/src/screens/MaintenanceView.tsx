import { Button, Card, EmptyState, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AdBanner, Fab, Field, HScroll, ItemRow, StatusBadge, VehicleChooser } from '@/components/ui';
import { MAINTENANCE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { sumByCurrency } from '@/features/money/money';
import { filterRecords, sortByUrgency } from '@/features/maintenance/schedule';
import { scheduleDues } from '@/features/reminders/plan';
import { useAsync, useFormat, useToday } from '@/hooks';
import { useVehicles } from '@/hooks/data';
import { usePreferences } from '@/store/preferences';
import { MAINTENANCE_TYPES, type MaintenanceType } from '@/types';

/** Maintenance hub: schedules due + searchable history. Used by the tab and by each vehicle. */
export function MaintenanceView({ fixedVehicleId, inTab }: { fixedVehicleId?: string; inTab?: boolean }) {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { data: vehicles } = useVehicles();
  const [selected, setSelected] = useState<string | null>(fixedVehicleId ?? null);
  const vehicleId = fixedVehicleId ?? selected;
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MaintenanceType | null>(null);

  const { data } = useAsync(async () => {
    const r = repos();
    const list = vehicleId ? [vehicleId] : (vehicles ?? []).map((v) => v.id);
    const perVehicle = await Promise.all(
      list.map(async (id) => {
        const [vehicle, readings, schedules] = await Promise.all([r.vehicles.get(id), r.odometer.list(id), r.schedules.list(id)]);
        return vehicle ? scheduleDues({ vehicle, readings, schedules, deadlines: [], policies: [], documents: [], tires: [] }, today).map((d) => ({ ...d, vehicle })) : [];
      }),
    );
    return { records: await r.maintenance.list(vehicleId ?? undefined), dues: sortByUrgency(perVehicle.flat()) };
  }, [vehicleId, today, vehicles?.length]);

  const records = useMemo(() => filterRecords(data?.records ?? [], { query, types: type ? [type] : [], typeLabel: (x) => t(`maintenanceTypes.${x}`) }), [data, query, type, t]);
  const total = sumByCurrency(records.map((r) => (r.costMinor ? { minor: r.costMinor, currency: r.currency } : null)));
  const names = new Map((vehicles ?? []).map((v) => [v.id, v.name]));
  const showVehicle = !vehicleId && (vehicles?.length ?? 0) > 1;
  const preferred = usePreferences.getState().currency;
  const usedTypes = MAINTENANCE_TYPES.filter((x) => data?.records.some((r) => r.type === x));

  return (
    <View style={{ flex: 1 }}>
      <Screen edges={inTab ? ['top'] : []}>
        {inTab ? <Text variant="title">{t('maintenance.title')}</Text> : null}
        {!fixedVehicleId ? <VehicleChooser vehicles={vehicles ?? []} value={selected} onChange={setSelected} allowAll allLabel={t('maintenance.allVehicles')} /> : null}

        <SectionHeader title={t('maintenance.schedules')} action={vehicleId ? t('common.seeAll') : undefined} onAction={() => vehicleId && router.push(`/vehicle/${vehicleId}/schedules`)} />
        <Card>
          {data?.dues.length ? (
            data.dues.slice(0, 5).map(({ schedule, due, vehicle }) => (
              <ItemRow
                key={schedule.id}
                icon={MAINTENANCE_ICONS[schedule.type]}
                tone={due.status === 'overdue' ? 'danger' : due.status === 'due_soon' ? 'warning' : 'primary'}
                title={schedule.title ?? t(`maintenanceTypes.${schedule.type}`)}
                subtitle={[
                  showVehicle ? vehicle.name : null,
                  due.dueDayByTime ? t('schedules.dueOn', { date: f.day(due.dueDayByTime) }) : null,
                  due.dueKm !== null ? t('schedules.dueAt', { distance: f.distance(due.dueKm) }) : null,
                  due.estimated && due.nextDay ? t('schedules.dueEstimated', { date: f.day(due.nextDay) }) : null,
                  due.neverDone ? t('schedules.neverDone') : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                badge={<StatusBadge status={due.status} />}
                onPress={() => router.push({ pathname: '/schedule/edit', params: { id: schedule.id } })}
              />
            ))
          ) : (
            <Text variant="bodySmall" tone="muted">
              {t('schedules.empty')}
            </Text>
          )}
          {vehicleId ? <Button label={t('schedules.add')} icon="add" variant="secondary" size="md" onPress={() => router.push({ pathname: '/schedule/edit', params: { vehicleId } })} /> : null}
        </Card>

        <Button label={t('maintenance.templates')} icon="checkbox-outline" variant="secondary" size="md" onPress={() => router.push('/templates')} />

        <SectionHeader title={t('maintenance.history')} />
        <Field label={t('common.search')} value={query} onChangeText={setQuery} placeholder={t('maintenance.searchPlaceholder')} returnKeyType="search" />
        {usedTypes.length > 1 ? (
          <HScroll>
            {[null, ...usedTypes].map((x) => (
              <Button key={x ?? 'all'} label={x ? t(`maintenanceTypes.${x}`) : t('common.all')} size="md" variant={type === x ? 'primary' : 'secondary'} onPress={() => setType(x)} />
            ))}
          </HScroll>
        ) : null}
        {records.length ? (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="bodySmall" tone="muted">
                {t('maintenance.totalCost')}
              </Text>
              <Text variant="subheading">{f.totals(total, preferred)}</Text>
            </Row>
            {records.map((r) => (
              <ItemRow
                key={r.id}
                icon={MAINTENANCE_ICONS[r.type]}
                title={r.title ?? t(`maintenanceTypes.${r.type}`)}
                subtitle={[f.day(r.day), r.odometerKm !== null ? f.distance(r.odometerKm) : null, r.provider, showVehicle ? names.get(r.vehicleId) : null].filter(Boolean).join(' · ')}
                value={r.costMinor !== null ? f.money(r.costMinor, r.currency) : null}
                onPress={() => router.push({ pathname: '/maintenance/edit', params: { id: r.id } })}
              />
            ))}
          </Card>
        ) : data ? (
          <EmptyState icon="construct-outline" title={query || type ? t('maintenance.emptyFiltered') : t('maintenance.empty')} />
        ) : null}
        {inTab ? <AdBanner screen="maintenance_list" /> : null}
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('maintenance.add')} onPress={() => router.push({ pathname: '/maintenance/edit', params: vehicleId ? { vehicleId } : {} })} />
    </View>
  );
}
