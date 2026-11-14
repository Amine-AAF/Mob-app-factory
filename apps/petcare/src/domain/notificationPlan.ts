import { needsRestock } from './care';
import { addDays, addMonths, atLocalTime, formatTime, toDayKey } from './dates';
import { isTreatmentOngoing, treatmentDays, treatmentStatus } from './health';
import type { Appointment, FeedingSchedule, FoodItem, NotificationCategory, NotificationSetting, Pet, Treatment, Vaccination } from './types';

/**
 * Computes the complete set of local notifications PetCare wants scheduled.
 * The service layer cancels what is no longer planned and schedules the rest
 * ("reconcile"), so the plan is the single source of truth and can be unit-tested.
 *
 * Date triggers are computed in the device's current time zone; the plan is rebuilt
 * whenever data changes and when the app returns to the foreground, which also
 * absorbs time-zone changes. Daily/weekly triggers are natively wall-clock based.
 */
export type PlannedTrigger =
  | { type: 'date'; date: Date }
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number };

export interface PlannedNotification {
  id: string;
  category: NotificationCategory;
  channel: 'health' | 'care';
  /** i18n keys + params, resolved at scheduling time in the current language. */
  titleKey: string;
  bodyKey: string;
  params: Record<string, string | number>;
  trigger: PlannedTrigger;
  /** Route opened when the notification is tapped. */
  url: string;
}

export interface PlanInput {
  now: Date;
  pets: readonly Pet[];
  vaccinations: readonly Vaccination[];
  treatments: readonly Treatment[];
  appointments: readonly Appointment[];
  feeding: readonly FeedingSchedule[];
  food: readonly FoodItem[];
  settings: readonly NotificationSetting[];
  /** Treatment dose reminders are planned this many days ahead (rolling window). */
  treatmentWindowDays?: number;
  /** Android caps scheduled alarms per app; keep a safe margin. */
  maxNotifications?: number;
}

export const PREFIX = 'pc-';

export function planNotifications(input: PlanInput): PlannedNotification[] {
  const { now } = input;
  const today = toDayKey(now);
  const setting = (c: NotificationCategory) => input.settings.find((s) => s.category === c);
  const enabled = (c: NotificationCategory) => setting(c)?.enabled === true;
  const timeOf = (c: NotificationCategory) => formatTime(setting(c)?.hour ?? 9, setting(c)?.minute ?? 0);
  const pets = new Map(input.pets.filter((p) => !p.archived).map((p) => [p.id, p]));
  const out: PlannedNotification[] = [];
  const future = (d: Date) => d.getTime() > now.getTime();

  if (enabled('vaccinations')) {
    for (const v of input.vaccinations) {
      const pet = pets.get(v.petId);
      if (!pet || !v.nextDueDate) continue;
      const base = { category: 'vaccinations' as const, channel: 'health' as const, params: { pet: pet.name, name: v.name }, url: `/pet/${pet.id}?tab=health` };
      const pre = atLocalTime(addDays(v.nextDueDate, -Math.max(0, v.reminderDaysBefore)), timeOf('vaccinations'));
      if (v.reminderDaysBefore > 0 && future(pre)) {
        out.push({ ...base, id: `${PREFIX}vac-${v.id}-pre`, titleKey: 'notif.vaccineSoonTitle', bodyKey: 'notif.vaccineSoonBody', params: { ...base.params, days: v.reminderDaysBefore }, trigger: { type: 'date', date: pre } });
      }
      const due = atLocalTime(v.nextDueDate, timeOf('vaccinations'));
      if (future(due)) out.push({ ...base, id: `${PREFIX}vac-${v.id}-due`, titleKey: 'notif.vaccineDueTitle', bodyKey: 'notif.vaccineDueBody', trigger: { type: 'date', date: due } });
    }
  }

  if (enabled('treatments')) {
    const window = input.treatmentWindowDays ?? 7;
    for (const tr of input.treatments) {
      const pet = pets.get(tr.petId);
      if (!pet) continue;
      const status = treatmentStatus(tr, today);
      if (!isTreatmentOngoing(status) && status !== 'scheduled') continue;
      const base = { category: 'treatments' as const, channel: 'health' as const, params: { pet: pet.name, name: tr.name }, url: `/record/treatment?id=${tr.id}` };
      if (tr.remindersEnabled) {
        for (const day of treatmentDays(tr, today, addDays(today, window))) {
          for (const time of tr.reminderTimes) {
            const at = atLocalTime(day, time);
            if (future(at)) out.push({ ...base, id: `${PREFIX}trt-${tr.id}-${day}-${time.replace(':', '')}`, titleKey: 'notif.treatmentTitle', bodyKey: 'notif.treatmentBody', params: { ...base.params, time }, trigger: { type: 'date', date: at } });
          }
        }
      }
      if (tr.endDate) {
        const end = atLocalTime(tr.endDate, timeOf('treatments'));
        if (future(end)) out.push({ ...base, id: `${PREFIX}trt-${tr.id}-end`, titleKey: 'notif.treatmentEndTitle', bodyKey: 'notif.treatmentEndBody', trigger: { type: 'date', date: end } });
      }
    }
  }

  if (enabled('appointments')) {
    for (const a of input.appointments) {
      const pet = pets.get(a.petId);
      if (!pet || a.status !== 'scheduled') continue;
      const at = new Date(new Date(a.startsAt).getTime() - Math.max(0, a.remindMinutesBefore) * 60_000);
      if (!future(at)) continue;
      const start = new Date(a.startsAt);
      out.push({
        id: `${PREFIX}apt-${a.id}`,
        category: 'appointments',
        channel: 'health',
        titleKey: `notif.appointmentTitle_${a.type}`,
        bodyKey: 'notif.appointmentBody',
        params: { pet: pet.name, time: formatTime(start.getHours(), start.getMinutes()), place: a.provider ?? a.title ?? '' },
        trigger: { type: 'date', date: at },
        url: `/record/appointment?id=${a.id}`,
      });
    }
  }

  if (enabled('meals')) {
    for (const f of input.feeding) {
      const pet = pets.get(f.petId);
      if (!pet || !f.active || !f.remindersEnabled) continue;
      for (const time of f.mealTimes) {
        const [hour, minute] = time.split(':').map(Number) as [number, number];
        out.push({ id: `${PREFIX}meal-${f.id}-${time.replace(':', '')}`, category: 'meals', channel: 'care', titleKey: 'notif.mealTitle', bodyKey: 'notif.mealBody', params: { pet: pet.name }, trigger: { type: 'daily', hour, minute }, url: `/pet/${pet.id}?tab=care` });
      }
    }
  }

  const dogs = [...pets.values()].filter((p) => p.species === 'dog');
  if (enabled('walks') && dogs.length > 0) {
    const s = setting('walks')!;
    out.push({ id: `${PREFIX}walk-daily`, category: 'walks', channel: 'care', titleKey: 'notif.walkTitle', bodyKey: 'notif.walkBody', params: { pet: dogs.map((d) => d.name).join(', ') }, trigger: { type: 'daily', hour: s.hour, minute: s.minute }, url: '/(tabs)/care' });
  }

  if (enabled('grooming') && pets.size > 0) {
    const s = setting('grooming')!;
    out.push({ id: `${PREFIX}groom-weekly`, category: 'grooming', channel: 'care', titleKey: 'notif.groomingTitle', bodyKey: 'notif.groomingBody', params: {}, trigger: { type: 'weekly', weekday: s.weekday ?? 6, hour: s.hour, minute: s.minute }, url: '/(tabs)/care' });
  }

  if (enabled('restock')) {
    for (const item of input.food) {
      if (!needsRestock(item)) continue;
      out.push({ id: `${PREFIX}restock-${item.id}`, category: 'restock', channel: 'care', titleKey: 'notif.restockTitle', bodyKey: 'notif.restockBody', params: { name: item.name }, trigger: { type: 'date', date: nextOccurrence(now, timeOf('restock')) }, url: '/list/food' });
    }
  }

  if (enabled('weighIn') && pets.size > 0) {
    out.push({ id: `${PREFIX}weigh-monthly`, category: 'weighIn', channel: 'care', titleKey: 'notif.weighTitle', bodyKey: 'notif.weighBody', params: {}, trigger: { type: 'date', date: atLocalTime(addMonths(today, 1), timeOf('weighIn')) }, url: '/(tabs)/health' });
  }

  // Keep the soonest date triggers when over the cap; repeating triggers always fit first.
  const max = input.maxNotifications ?? 60;
  const repeating = out.filter((n) => n.trigger.type !== 'date');
  const dated = out.filter((n) => n.trigger.type === 'date').sort((a, b) => (a.trigger as { date: Date }).date.getTime() - (b.trigger as { date: Date }).date.getTime());
  return [...repeating, ...dated].slice(0, max);
}

/** Today at `time` if still ahead, otherwise tomorrow at `time`. */
export function nextOccurrence(now: Date, time: string): Date {
  const today = toDayKey(now);
  const at = atLocalTime(today, time);
  return at.getTime() > now.getTime() ? at : atLocalTime(addDays(today, 1), time);
}
