import type { Repositories } from '@/database';
import { needsRestock } from '@/domain/care';
import { addDays, diffDays, toDayKey } from '@/domain/dates';
import { inMonth, totalsByCurrency, type CurrencyTotal } from '@/domain/expenses';
import { isTreatmentOngoing, treatmentDays, treatmentStatus, vaccinationStatus } from '@/domain/health';
import type { Activity, Appointment, FeedingSchedule, FoodItem, HealthRecord, Pet, Treatment, Vaccination, WeightRecord } from '@/domain/types';

export interface TodayItem {
  kind: 'treatment' | 'meal' | 'vaccination' | 'appointment';
  id: string;
  petId: string;
  title: string;
  time: string | null;
}

export interface Dashboard {
  pets: Pet[];
  upcomingAppointments: Appointment[];
  vaccinationsDue: (Vaccination & { status: 'upcoming' | 'overdue'; days: number })[];
  activeTreatments: Treatment[];
  today: TodayItem[];
  recent: { kind: 'health' | 'activity' | 'weight'; id: string; petId: string; date: string; label: string }[];
  latestWeights: Record<string, WeightRecord | undefined>;
  monthExpenses: CurrencyTotal[];
  restock: FoodItem[];
}

/** Vaccinations due within this many days appear on the dashboard. */
export const DASHBOARD_VACCINE_WINDOW = 30;

export function buildDashboard(input: {
  now: Date;
  pets: Pet[];
  appointments: Appointment[];
  vaccinations: Vaccination[];
  treatments: Treatment[];
  feeding: FeedingSchedule[];
  health: HealthRecord[];
  activities: Activity[];
  weights: WeightRecord[];
  expenses: Parameters<typeof inMonth>[0];
  food: FoodItem[];
}): Dashboard {
  const today = toDayKey(input.now);
  const active = new Set(input.pets.filter((p) => !p.archived).map((p) => p.id));
  const mine = <T extends { petId: string | null }>(list: T[]) => list.filter((x) => x.petId != null && active.has(x.petId));

  const upcomingAppointments = mine(input.appointments)
    .filter((a) => a.status === 'scheduled' && new Date(a.startsAt).getTime() >= input.now.getTime())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 5);

  const vaccinationsDue = mine(input.vaccinations)
    .map((v) => ({ ...v, status: vaccinationStatus(v, today), days: v.nextDueDate ? diffDays(today, v.nextDueDate) : Infinity }))
    .filter((v): v is Vaccination & { status: 'upcoming' | 'overdue'; days: number } => v.status !== 'done' && v.days <= DASHBOARD_VACCINE_WINDOW)
    .sort((a, b) => a.days - b.days);

  const activeTreatments = mine(input.treatments).filter((t) => isTreatmentOngoing(treatmentStatus(t, today)));

  const todayItems: TodayItem[] = [];
  for (const t of activeTreatments) {
    if (!treatmentDays(t, today, today).length) continue;
    const times = t.reminderTimes.length ? t.reminderTimes : [null];
    for (const time of times) todayItems.push({ kind: 'treatment', id: t.id, petId: t.petId, title: t.name, time });
  }
  for (const f of mine(input.feeding).filter((f) => f.active)) {
    for (const time of f.mealTimes) todayItems.push({ kind: 'meal', id: f.id, petId: f.petId, title: [f.brand, f.product].filter(Boolean).join(' ') || f.foodType, time });
  }
  for (const v of vaccinationsDue.filter((v) => v.days === 0)) todayItems.push({ kind: 'vaccination', id: v.id, petId: v.petId, title: v.name, time: null });
  for (const a of upcomingAppointments.filter((a) => toDayKey(new Date(a.startsAt)) === today)) {
    const d = new Date(a.startsAt);
    todayItems.push({ kind: 'appointment', id: a.id, petId: a.petId, title: a.title ?? a.provider ?? a.type, time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` });
  }
  todayItems.sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));

  const since = addDays(today, -14);
  const recent = [
    ...mine(input.health).map((h) => ({ kind: 'health' as const, id: h.id, petId: h.petId, date: h.date, label: h.reason })),
    ...mine(input.activities).map((a) => ({ kind: 'activity' as const, id: a.id, petId: a.petId, date: toDayKey(new Date(a.date)), label: a.type })),
    ...mine(input.weights).map((w) => ({ kind: 'weight' as const, id: w.id, petId: w.petId, date: w.date, label: String(w.weightKg) })),
  ]
    .filter((r) => r.date >= since && r.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const latestWeights: Record<string, WeightRecord | undefined> = {};
  for (const w of [...input.weights].sort((a, b) => a.date.localeCompare(b.date))) latestWeights[w.petId] = w;

  return {
    pets: input.pets.filter((p) => !p.archived),
    upcomingAppointments,
    vaccinationsDue,
    activeTreatments,
    today: todayItems,
    recent,
    latestWeights,
    monthExpenses: totalsByCurrency(inMonth(input.expenses, today)),
    restock: input.food.filter((f) => needsRestock(f)),
  };
}

export async function loadDashboard(r: Repositories, now: Date): Promise<Dashboard> {
  const [pets, appointments, vaccinations, treatments, feeding, health, activities, weights, expenses, food] = await Promise.all([
    r.pets.listAll(),
    r.appointments.upcoming(new Date(now.getTime() - 3600_000).toISOString()),
    r.vaccinations.all(),
    r.treatments.all(),
    r.feeding.all(),
    r.health.all(),
    r.activities.all(),
    r.weights.all(),
    r.expenses.between(toDayKey(new Date(now.getFullYear(), now.getMonth(), 1)), toDayKey(now)),
    r.food.all(),
  ]);
  return buildDashboard({ now, pets, appointments, vaccinations, treatments, feeding, health, activities, weights, expenses, food });
}
