import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { DEADLINE_ICONS, DOCUMENT_ICONS, MAINTENANCE_ICONS } from '@/constants/icons';
import type { Formatter } from '@/features/format/format';
import type { Alert } from '@/features/reminders/plan';
import { useFormat } from '@/hooks';
import type { DeadlineType, DocumentCategory, MaintenanceType } from '@/types';
import { diffDays } from '@/utils/dates';

import { ItemRow } from './ui';

export function alertTitle(a: Alert, t: TFunction): string {
  switch (a.kind) {
    case 'maintenance':
      return a.title ?? t(`maintenanceTypes.${a.subtype}`);
    case 'deadline':
      return a.title ?? t(`deadlineTypes.${a.subtype}`);
    case 'insurance':
      return t('alerts.insurance', { label: a.title ?? '' });
    case 'document':
      return t('alerts.document', { label: a.title ?? t(`documentCategories.${a.subtype}`) });
    case 'tire':
      return `${t(`tireSeasons.${a.subtype}`)} — ${a.title ?? ''}`;
    case 'odometer':
      return t('alerts.odometer');
  }
}

export function alertSubtitle(a: Alert, t: TFunction, f: Formatter, today: string, vehicleName?: string): string {
  const parts: string[] = [];
  if (vehicleName) parts.push(vehicleName);
  if (a.kind === 'odometer') parts.push(t('home.lastReading', { date: f.day(a.day) }));
  else {
    if (a.day) {
      const d = diffDays(today, a.day);
      parts.push(d < 0 ? t('common.overdueBy', { count: -d }) : `${f.day(a.day)} · ${t('common.daysLeft', { count: d })}`);
    }
    if (a.kmRemaining !== null) parts.push(a.kmRemaining <= 0 ? t('common.overDistance', { distance: f.distance(-a.kmRemaining) }) : t('common.inDistance', { distance: f.distance(a.kmRemaining) }));
    if (a.estimated) parts.push(t('common.estimated'));
  }
  return parts.join(' · ');
}

const ROUTES: Record<Alert['kind'], string> = {
  maintenance: 'schedules',
  deadline: 'deadlines',
  insurance: 'insurance',
  document: 'documents',
  tire: 'tires',
  odometer: 'odometer',
};

export function AlertRow({ alert, today, vehicleName }: { alert: Alert; today: string; vehicleName?: string }) {
  const { t } = useTranslation();
  const f = useFormat();
  const icon =
    alert.kind === 'maintenance'
      ? MAINTENANCE_ICONS[alert.subtype as MaintenanceType]
      : alert.kind === 'deadline'
        ? DEADLINE_ICONS[alert.subtype as DeadlineType]
        : alert.kind === 'document'
          ? DOCUMENT_ICONS[alert.subtype as DocumentCategory]
          : alert.kind === 'insurance'
            ? 'shield-checkmark'
            : alert.kind === 'tire'
              ? 'ellipse'
              : 'speedometer';
  return (
    <ItemRow
      icon={icon ?? 'alert-circle'}
      tone={alert.severity === 'overdue' ? 'danger' : 'warning'}
      title={alertTitle(alert, t)}
      subtitle={alertSubtitle(alert, t, f, today, vehicleName)}
      onPress={() => (alert.kind === 'odometer' ? router.push({ pathname: '/odometer', params: { vehicleId: alert.vehicleId } }) : router.push(`/vehicle/${alert.vehicleId}/${ROUTES[alert.kind]}` as never))}
    />
  );
}
