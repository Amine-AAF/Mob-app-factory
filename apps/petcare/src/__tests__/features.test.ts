import { FREE_STATE } from '@factory/monetization';
import { createTestDatabase } from '@factory/testing';

import { TEMPLATES, templateItems, templateTitle } from '@/content/templates';
import { initDatabase } from '@/database';
import { buildDashboard } from '@/features/dashboard/load';
import { fromForm, RECORD_KINDS, SPECS, toForm, type FormContext } from '@/features/records/specs';
import { FREE_LIMITS } from '@/domain/limits';
import type { Pet } from '@/domain/types';
import { initMonetization } from '@/services/monetization';
import { useSession } from '@/store/session';

const ctx: FormContext = { petId: 'p1', today: '2026-11-13', nowTime: '10:30', weightUnit: 'kg', currency: 'EUR' };

describe('record forms', () => {
  it.each(RECORD_KINDS)('%s defaults convert to a valid entity once required fields are filled', (kind) => {
    const spec = SPECS[kind];
    const values = { ...spec.defaults(ctx) };
    for (const f of spec.fields) {
      if (f.required && (values[f.name] === undefined || values[f.name] === '' || values[f.name] === null)) values[f.name] = f.type === 'weight' || f.type === 'decimal' || f.type === 'money' ? '5' : 'Something';
    }
    expect(spec.validate?.(values) ?? {}).toEqual({});
    const entity = fromForm(spec, values, 'kg', 'EUR');
    expect(entity).toBeTruthy();
  });

  it('never pre-fills medical content (diagnosis, instructions, vaccine name)', () => {
    expect(SPECS.health.defaults(ctx).diagnosis).toBeUndefined();
    expect(SPECS.treatment.defaults(ctx).instructions).toBeUndefined();
    expect(SPECS.vaccination.defaults(ctx).name).toBeUndefined();
    expect(SPECS.vaccination.defaults(ctx).nextDueDate).toBeUndefined();
  });

  it('validates treatment and vaccination dates', () => {
    const t = { ...SPECS.treatment.defaults(ctx), name: 'Drops', startDate: '2026-11-13', endDate: '2026-11-01' };
    expect(SPECS.treatment.validate!(t)).toEqual({ endDate: 'errors.endBeforeStart' });
    const v = { ...SPECS.vaccination.defaults(ctx), name: 'Rabies', administeredDate: '2026-11-13', nextDueDate: '2026-01-01' };
    expect(SPECS.vaccination.validate!(v)).toEqual({ nextDueDate: 'errors.dueBeforeAdministered' });
    expect(SPECS.vaccination.validate!({ name: 'X', administeredDate: null, nextDueDate: null })).toEqual({ nextDueDate: 'errors.vaccineDate' });
    expect(SPECS.treatment.validate!({ ...t, endDate: null, remindersEnabled: true, reminderTimes: [] })).toEqual({ reminderTimes: 'errors.addTime' });
  });

  it('changes default reminder times when the frequency changes (times only, never doses)', () => {
    expect(SPECS.treatment.onChange!('frequency', 'twice_daily', {})).toEqual({ reminderTimes: ['08:00', '20:00'] });
  });

  it('stores weight in kg whatever the display unit', () => {
    const spec = SPECS.weight;
    const entity = fromForm(spec, { petId: 'p1', date: '2026-11-13', weightKg: '22', heightCm: '', notes: '' }, 'lb', 'EUR');
    expect(entity.weightKg).toBeCloseTo(9.979, 2);
    expect(toForm(spec, entity, 'lb').weightKg).toBe('22');
    expect(entity.notes).toBeNull();
  });

  it('round-trips appointment date & time and money with currency', () => {
    const spec = SPECS.appointment;
    const values = { ...spec.defaults(ctx), startsAt: { day: '2026-12-01', time: '14:45' }, estimatedCost: '35,5', currency: 'MAD' };
    const entity = fromForm(spec, values, 'kg', 'EUR');
    expect(entity.estimatedCost).toBe(35.5);
    expect(entity.currency).toBe('MAD');
    expect(entity.remindMinutesBefore).toBe(60);
    const back = toForm(spec, entity, 'kg');
    expect(back.startsAt).toEqual({ day: '2026-12-01', time: '14:45' });
  });

  it('requires a valid amount for expenses', () => {
    expect(SPECS.expense.validate!({ ...SPECS.expense.defaults(ctx), amount: '' })).toEqual({ amount: 'errors.number' });
    expect(SPECS.expense.validate!({ ...SPECS.expense.defaults(ctx), amount: '12,30' })).toEqual({});
  });
});

describe('care templates', () => {
  it('ships at least 30 templates with unique ids', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    expect(TEMPLATES.length).toBeGreaterThan(FREE_LIMITS.freeTemplates);
  });

  it.each(['en', 'fr', 'es'] as const)('every template is fully translated in %s', (lng) => {
    for (const t of TEMPLATES) {
      expect(templateTitle(t, lng).trim().length).toBeGreaterThan(3);
      const items = templateItems(t, lng);
      expect(items.length).toBeGreaterThanOrEqual(5);
      items.forEach((i) => expect(i.trim().length).toBeGreaterThan(2));
    }
  });

  it('contains no dosage or medication amount', () => {
    const text = TEMPLATES.flatMap((t) => t.items.flat()).join('\n');
    expect(text).not.toMatch(/\d+\s?(mg|ml|mL|µg|mcg|UI|IU)\b/);
  });

  it('includes the requested core templates', () => {
    for (const id of ['new_pet', 'puppy', 'kitten', 'travel', 'grooming_routine', 'weekly_dog', 'cat_routine', 'vet_visit']) expect(TEMPLATES.some((t) => t.id === id)).toBe(true);
  });
});

describe('dashboard', () => {
  const pet = (id: string, archived = false): Pet => ({ id, name: id, species: 'dog', breed: null, sex: null, birthDate: null, birthEstimated: false, weightKg: null, color: null, identification: null, adoptionDate: null, notes: null, photo: null, walkGoalMinutes: 60, archived, createdAt: '', updatedAt: '' });

  it('summarises today, upcoming vaccinations, treatments and month expenses across pets', () => {
    const now = new Date(2026, 10, 13, 9, 0);
    const d = buildDashboard({
      now,
      pets: [pet('rex'), pet('old', true)],
      appointments: [{ id: 'a1', petId: 'rex', type: 'vet', startsAt: new Date(2026, 10, 13, 17, 0).toISOString(), title: 'Booster', address: null, provider: null, phone: null, notes: null, estimatedCost: null, currency: null, status: 'scheduled', remindMinutesBefore: 60, createdAt: '', updatedAt: '' }],
      vaccinations: [
        { id: 'v1', petId: 'rex', name: 'Rabies', administeredDate: null, nextDueDate: '2026-11-20', vetName: null, notes: null, reminderDaysBefore: 7, createdAt: '', updatedAt: '' },
        { id: 'v2', petId: 'rex', name: 'Lepto', administeredDate: null, nextDueDate: '2027-06-01', vetName: null, notes: null, reminderDaysBefore: 7, createdAt: '', updatedAt: '' },
        { id: 'v3', petId: 'old', name: 'Archived pet', administeredDate: null, nextDueDate: '2026-11-14', vetName: null, notes: null, reminderDaysBefore: 7, createdAt: '', updatedAt: '' },
      ],
      treatments: [{ id: 't1', petId: 'rex', name: 'Drops', instructions: null, startDate: '2026-11-10', endDate: '2026-11-20', frequency: 'twice_daily', reminderTimes: ['08:00', '20:00'], remindersEnabled: true, prescriber: null, notes: null, stoppedAt: null, createdAt: '', updatedAt: '' }],
      feeding: [{ id: 'f1', petId: 'rex', foodType: 'dry', brand: 'Brand', product: null, quantity: null, mealTimes: ['07:00'], remindersEnabled: false, active: true, notes: null, createdAt: '', updatedAt: '' }],
      health: [],
      activities: [],
      weights: [{ id: 'w1', petId: 'rex', date: '2026-11-01', weightKg: 20, heightCm: null, notes: null, createdAt: '' }],
      expenses: [{ id: 'e1', petId: 'rex', date: '2026-11-02', amount: 10, currency: 'EUR', category: 'food', notes: null, receiptDocumentId: null, createdAt: '' }],
      food: [],
    });
    expect(d.pets.map((p) => p.id)).toEqual(['rex']);
    expect(d.vaccinationsDue.map((v) => v.id)).toEqual(['v1']);
    expect(d.activeTreatments).toHaveLength(1);
    expect(d.today.map((i) => `${i.kind}@${i.time}`)).toEqual(['meal@07:00', 'treatment@08:00', 'appointment@17:00', 'treatment@20:00']);
    expect(d.monthExpenses).toEqual([{ currency: 'EUR', total: 10 }]);
    expect(d.latestWeights.rex?.weightKg).toBe(20);
  });
});

describe('monetization (offline-first)', () => {
  it('stays free without a store key and never fakes a purchase', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    await initMonetization(db);
    expect(useSession.getState().entitlement).toEqual(FREE_STATE);
  });

  it('honours a recent cached premium state while offline', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const verifiedAt = new Date(Date.now() - 2 * 86_400_000).toISOString();
    await db.runAsync('INSERT INTO subscription_cache (id, state, updated_at) VALUES (1, ?, ?)', [
      JSON.stringify({ isPremium: true, expiresAt: null, productId: 'petcare_premium_lifetime', willRenew: false, verifiedAt, source: 'store' }),
      verifiedAt,
    ]);
    await initMonetization(db, {
      name: 'offline',
      isConfigured: true,
      initialize: async () => undefined,
      fetchEntitlement: async () => null, // store unreachable
      getPlans: async () => [],
      purchase: async () => ({ status: 'cancelled' }),
      restore: async () => null,
      onChange: () => () => undefined,
    });
    expect(useSession.getState().entitlement.isPremium).toBe(true);
    expect(useSession.getState().entitlement.source).toBe('cache');
  });
});
