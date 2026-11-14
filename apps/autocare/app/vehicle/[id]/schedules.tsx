import { Button, Card, EmptyState, Screen } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { InfoNote, ItemRow, StatusBadge } from '@/components/ui';
import { MAINTENANCE_ICONS } from '@/constants/icons';
import { repos } from '@/database';
import { computeDue, sortByUrgency } from '@/features/maintenance/schedule';
import { deriveOdometer } from '@/features/reminders/plan';
import { useAsync, useFormat, useToday } from '@/hooks';

export default function VehicleSchedules() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(async () => {
    const [vehicle, readings, schedules] = await Promise.all([repos().vehicles.get(id), repos().odometer.list(id), repos().schedules.list(id)]);
    if (!vehicle) return [];
    const odo = deriveOdometer({ vehicle, readings }, today);
    return sortByUrgency(schedules.map((schedule) => ({ schedule, due: computeDue(schedule, { today, odometerKm: odo.knownKm, latest: odo.latest, rate: odo.rate }) })));
  }, [id, today]);

  return (
    <>
      <RouterStack.Screen options={{ title: t('schedules.title') }} />
      <Screen edges={[]}>
        <InfoNote text={t('schedules.intro')} />
        {data && data.length === 0 ? <EmptyState icon="calendar-outline" title={t('schedules.empty')} /> : null}
        {data?.length ? (
          <Card>
            {data.map(({ schedule, due }) => (
              <ItemRow
                key={schedule.id}
                icon={MAINTENANCE_ICONS[schedule.type]}
                tone={!schedule.enabled ? 'neutral' : due.status === 'overdue' ? 'danger' : due.status === 'due_soon' ? 'warning' : 'primary'}
                title={schedule.title ?? t(`maintenanceTypes.${schedule.type}`)}
                subtitle={[
                  schedule.intervalKm ? f.distance(schedule.intervalKm) : null,
                  schedule.intervalMonths ? t('common.months', { count: schedule.intervalMonths }) : null,
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
            ))}
          </Card>
        ) : null}
        <Button label={t('schedules.add')} icon="add" onPress={() => router.push({ pathname: '/schedule/edit', params: { vehicleId: id } })} />
        <InfoNote text={t('common.estimatedLong')} icon="analytics-outline" />
      </Screen>
    </>
  );
}
