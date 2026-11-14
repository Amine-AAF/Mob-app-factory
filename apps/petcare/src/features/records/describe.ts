import type { TFunction } from 'i18next';

import { stockLevel } from '@/domain/care';
import { isPastDueAppointment, treatmentStatus, vaccinationStatus } from '@/domain/health';
import type { Activity, Appointment, Expense, FeedingSchedule, FoodItem, HealthRecord, Treatment, Vaccination, WeightRecord } from '@/domain/types';
import type { WeightUnit } from '@/domain/units';
import { fmt } from '@/i18n';

import type { RecordKind } from './specs';

export interface RowInfo {
  title: string;
  subtitle: string;
  status?: string;
  /** Sort / group key. */
  group?: string;
}

/** One-line summaries for list rows. Shows the user's own values only. */
export function describe(kind: RecordKind, e: Record<string, unknown>, ctx: { t: TFunction; petName: string; today: string; now: Date; unit: WeightUnit }): RowInfo {
  const { t, petName, today } = ctx;
  const join = (...parts: (string | null | undefined | false)[]) => parts.filter(Boolean).join(' · ');
  switch (kind) {
    case 'health': {
      const h = e as unknown as HealthRecord;
      return { title: h.reason, subtitle: join(petName, fmt.day(h.date), h.vetName ?? h.clinic) };
    }
    case 'vaccination': {
      const v = e as unknown as Vaccination;
      const status = vaccinationStatus(v, today);
      return {
        title: v.name,
        subtitle: join(petName, v.nextDueDate ? t('records.vaccination.dueOn', { date: fmt.day(v.nextDueDate) }) : v.administeredDate ? t('records.vaccination.givenOn', { date: fmt.day(v.administeredDate) }) : null),
        status,
        group: status,
      };
    }
    case 'treatment': {
      const tr = e as unknown as Treatment;
      const status = treatmentStatus(tr, today);
      return {
        title: tr.name,
        subtitle: join(petName, t(`options.frequency.${tr.frequency}`), tr.endDate ? t('records.treatment.until', { date: fmt.day(tr.endDate) }) : t('records.treatment.noEnd')),
        status,
        group: status === 'active' || status === 'ending_soon' || status === 'scheduled' ? 'current' : 'past',
      };
    }
    case 'weight': {
      const w = e as unknown as WeightRecord;
      return { title: fmt.weight(w.weightKg, ctx.unit), subtitle: join(petName, fmt.day(w.date), w.heightCm ? `${fmt.number(w.heightCm)} cm` : null) };
    }
    case 'feeding': {
      const f = e as unknown as FeedingSchedule;
      return {
        title: join(t(`options.foodType.${f.foodType}`), f.brand, f.product),
        subtitle: join(petName, f.quantity, f.mealTimes.join(', ')),
        status: f.active ? undefined : 'stopped',
      };
    }
    case 'food': {
      const f = e as unknown as FoodItem;
      const level = stockLevel(f);
      return { title: join(f.name, f.brand), subtitle: join(`${fmt.number(f.quantity, 2)} ${t(`options.unit.${f.unit}`)}`, petName || null), status: level };
    }
    case 'appointment': {
      const a = e as unknown as Appointment;
      const pastDue = isPastDueAppointment(a, ctx.now);
      return {
        title: join(t(`options.appointmentType.${a.type}`), a.title ?? a.provider),
        subtitle: join(petName, fmt.dateTime(a.startsAt), a.address),
        status: pastDue ? 'upcoming' : a.status,
        group: a.status === 'scheduled' && !pastDue ? 'current' : 'past',
      };
    }
    case 'activity': {
      const a = e as unknown as Activity;
      return {
        title: t(`options.activityType.${a.type}`),
        subtitle: join(petName, fmt.dateTime(a.date), a.durationMinutes != null ? t('common.minutes', { count: a.durationMinutes }) : null, a.distanceKm != null ? `${fmt.number(a.distanceKm, 2)} km` : null),
      };
    }
    case 'expense': {
      const x = e as unknown as Expense;
      return { title: fmt.money(x.amount, x.currency), subtitle: join(t(`options.expenseCategory.${x.category}`), petName || null, fmt.day(x.date), x.notes) };
    }
  }
}
