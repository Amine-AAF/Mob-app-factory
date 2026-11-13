import { buildAgenda, afterCompletion, afterPostpone, afterSkip, daysUntil, dueStatus, isValidInterval, monthGrid, occurrencesBetween, weekDays } from '@/domain/schedule';
import { canAddGrowthRecord, canAddLocation, canAddPlant, canAttachJournalPhoto, canOpenSpecies, FREE_PLANT_LIMIT } from '@/domain/limits';
import { isTypeEnabled, planNotifications } from '@/domain/notificationPlan';
import { currentSeason, seasonKey } from '@/domain/seasons';
import { computeInsights } from '@/domain/stats';
import type { CareTask, Plant } from '@/domain/types';
import { celsiusTo, defaultTemperatureUnit, defaultUnitSystem, lengthFromCm, lengthToCm, parseDecimal, volumeFromMl, volumeToMl } from '@/domain/units';

const task = (over: Partial<CareTask> = {}): CareTask => ({
  id: 't1',
  plantId: 'p1',
  type: 'watering',
  nextDue: '2026-05-10',
  intervalDays: 7,
  priority: 'normal',
  notes: '',
  amountMl: null,
  remindersEnabled: true,
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

const plant = (over: Partial<Plant> = {}): Plant => ({
  id: 'p1',
  nickname: 'Monty',
  commonName: '',
  scientificName: null,
  speciesId: null,
  category: 'tropical',
  photoPath: null,
  acquiredOn: null,
  plantedOn: null,
  locationId: null,
  description: '',
  notes: '',
  favorite: false,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
  ...over,
});

describe('schedule rules', () => {
  it('classifies due status, including past dates', () => {
    expect(dueStatus(task({ nextDue: '2026-05-09' }), '2026-05-10')).toBe('overdue');
    expect(dueStatus(task(), '2026-05-10')).toBe('today');
    expect(dueStatus(task({ nextDue: '2026-05-11' }), '2026-05-10')).toBe('upcoming');
    expect(dueStatus(task({ active: false }), '2026-05-10')).toBe('none');
    expect(daysUntil(task({ nextDue: '2026-04-30' }), '2026-05-10')).toBe(-10);
  });

  it('re-plans from the actual completion day', () => {
    expect(afterCompletion(task(), '2026-05-12')).toEqual({ nextDue: '2026-05-19', active: true });
    expect(afterCompletion(task({ intervalDays: null }), '2026-05-12')).toEqual({ nextDue: null, active: false });
  });

  it('skip keeps rhythm; postpone moves from the later of today/due', () => {
    expect(afterSkip(task({ nextDue: '2026-05-01' }), '2026-05-10').nextDue).toBe('2026-05-17');
    expect(afterSkip(task({ nextDue: '2026-05-12' }), '2026-05-10').nextDue).toBe('2026-05-19');
    expect(afterPostpone(task({ nextDue: '2026-05-01' }), 2, '2026-05-10').nextDue).toBe('2026-05-12');
    expect(() => afterPostpone(task(), 0, '2026-05-10')).toThrow();
  });

  it('validates intervals', () => {
    expect(isValidInterval(7)).toBe(true);
    expect(isValidInterval(null)).toBe(true);
    expect(isValidInterval(0)).toBe(false);
    expect(isValidInterval(1.5)).toBe(false);
    expect(isValidInterval(400)).toBe(false);
  });

  it('projects recurring occurrences for calendar views without going backwards', () => {
    expect(occurrencesBetween(task({ nextDue: '2026-05-03', intervalDays: 7 }), '2026-05-01', '2026-05-31')).toEqual(['2026-05-03', '2026-05-10', '2026-05-17', '2026-05-24', '2026-05-31']);
    expect(occurrencesBetween(task({ nextDue: '2026-04-20', intervalDays: 7 }), '2026-05-01', '2026-05-10')).toEqual(['2026-05-04']);
    expect(occurrencesBetween(task({ intervalDays: null }), '2026-05-01', '2026-05-31')).toEqual(['2026-05-10']);
    expect(occurrencesBetween(task({ active: false }), '2026-05-01', '2026-05-31')).toEqual([]);
  });

  it('builds the agenda: overdue first, then today by priority, then upcoming in horizon', () => {
    const tasks = [
      task({ id: 'a', nextDue: '2026-05-10', priority: 'low', type: 'pruning' }),
      task({ id: 'b', nextDue: '2026-05-10', priority: 'high', type: 'fertilizing' }),
      task({ id: 'c', nextDue: '2026-05-02' }),
      task({ id: 'd', nextDue: '2026-05-14' }),
      task({ id: 'e', nextDue: '2026-06-30' }),
    ];
    const ag = buildAgenda(tasks, '2026-05-10', 7);
    expect(ag.overdue.map((t) => t.id)).toEqual(['c']);
    expect(ag.today.map((t) => t.id)).toEqual(['b', 'a']);
    expect(ag.upcoming.map((t) => t.id)).toEqual(['d']);
  });

  it('builds Monday-first month and week grids', () => {
    const grid = monthGrid(2026, 4); // May 2026 starts on a Friday
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-04-27');
    expect(grid[4]).toBe('2026-05-01');
    expect(weekDays('2026-05-10')).toEqual(['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10']);
  });
});

describe('units', () => {
  it('converts for display only and parses both decimal separators', () => {
    expect(lengthFromCm(25.4, 'imperial')).toBe(10);
    expect(lengthToCm(10, 'imperial')).toBe(25.4);
    expect(volumeFromMl(250, 'metric')).toBe(250);
    expect(volumeToMl(8, 'imperial')).toBe(237);
    expect(volumeFromMl(237, 'imperial')).toBe(8);
    expect(celsiusTo(20, 'f')).toBe(68);
    expect(celsiusTo(-5, 'c')).toBe(-5);
    expect(parseDecimal('12,5')).toBe(12.5);
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('-3')).toBeNull();
    expect(defaultUnitSystem('US')).toBe('imperial');
    expect(defaultUnitSystem('FR')).toBe('metric');
    expect(defaultTemperatureUnit('us')).toBe('f');
    expect(defaultTemperatureUnit(null)).toBe('c');
  });
});

describe('seasons by climate profile', () => {
  it('never assumes the northern hemisphere', () => {
    expect(currentSeason('2026-07-15', 'north')).toBe('summer');
    expect(currentSeason('2026-07-15', 'south')).toBe('winter');
    expect(currentSeason('2026-07-15', 'tropical')).toBeNull();
    expect(currentSeason('2026-07-15', 'none')).toBeNull();
  });

  it('attributes a winter spanning two years to its starting year', () => {
    expect(seasonKey('2027-01-15', 'winter', 'north')).toBe('2026-winter');
    expect(seasonKey('2026-12-15', 'winter', 'north')).toBe('2026-winter');
    expect(seasonKey('2027-01-15', 'summer', 'south')).toBe('2026-summer');
    expect(seasonKey('2026-04-15', 'spring', 'north')).toBe('2026-spring');
  });
});

describe('free vs premium limits', () => {
  it('gates additions only', () => {
    expect(canAddPlant(false, FREE_PLANT_LIMIT - 1)).toBe(true);
    expect(canAddPlant(false, FREE_PLANT_LIMIT)).toBe(false);
    expect(canAddPlant(true, 500)).toBe(true);
    expect(canAddLocation(false, 3)).toBe(false);
    expect(canAddGrowthRecord(false, 5)).toBe(false);
    expect(canAttachJournalPhoto(false)).toBe(false);
    expect(canAttachJournalPhoto(true)).toBe(true);
    expect(canOpenSpecies(false, { core: false })).toBe(false);
    expect(canOpenSpecies(false, { core: true })).toBe(true);
  });
});

describe('notification plan', () => {
  const base = {
    plants: [{ id: 'p1', nickname: 'Monty' }, { id: 'p2', nickname: 'Basil' }],
    settings: [],
    globalEnabled: true,
    hour: 9,
    minute: 0,
    today: '2026-05-10',
    nowMinutes: 8 * 60,
  };

  it('groups tasks into at most one notification per day', () => {
    const plan = planNotifications({ ...base, tasks: [task({ id: 'a' }), task({ id: 'b', plantId: 'p2' }), task({ id: 'c', nextDue: '2026-05-12' })] });
    expect(plan.map((n) => n.day)).toEqual(['2026-05-10', '2026-05-12']);
    expect(plan[0]?.items).toHaveLength(2);
  });

  it('sends overdue care as a single reminder today, never daily nagging', () => {
    const plan = planNotifications({ ...base, tasks: [task({ id: 'old', nextDue: '2026-05-01' })] });
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ day: '2026-05-10', overdue: true });
    expect(planNotifications({ ...base, nowMinutes: 10 * 60, tasks: [task({ id: 'old', nextDue: '2026-05-01' })] })).toHaveLength(0);
  });

  it('respects global, type, plant and task switches, and the horizon', () => {
    expect(planNotifications({ ...base, globalEnabled: false, tasks: [task()] })).toEqual([]);
    expect(planNotifications({ ...base, tasks: [task({ remindersEnabled: false })] })).toEqual([]);
    expect(planNotifications({ ...base, settings: [{ plantId: null, taskType: 'watering', enabled: false }], tasks: [task()] })).toEqual([]);
    const plantOverride = [{ plantId: null, taskType: 'watering' as const, enabled: false }, { plantId: 'p1', taskType: 'watering' as const, enabled: true }];
    expect(planNotifications({ ...base, settings: plantOverride, tasks: [task()] })).toHaveLength(1);
    expect(isTypeEnabled(plantOverride, 'p2', 'watering')).toBe(false);
    expect(planNotifications({ ...base, tasks: [task({ nextDue: '2026-07-01' })] })).toEqual([]);
    expect(planNotifications({ ...base, tasks: [task({ plantId: 'deleted' })] })).toEqual([]);
  });

  it('skips today once the reminder time has passed', () => {
    const plan = planNotifications({ ...base, nowMinutes: 9 * 60 + 1, tasks: [task(), task({ id: 'x', nextDue: '2026-05-11' })] });
    expect(plan.map((n) => n.day)).toEqual(['2026-05-11']);
  });
});

describe('insights', () => {
  it('computes collection, care and attention metrics', () => {
    const ins = computeInsights({
      today: '2026-05-10',
      plants: [plant(), plant({ id: 'p2', category: 'herb', favorite: true, createdAt: '2026-05-02T10:00:00.000Z' })],
      tasks: [task({ nextDue: '2026-05-01' }), task({ id: 't2', plantId: 'p2', nextDue: '2026-05-20' })],
      history: [
        { id: 'h1', taskId: 't2', plantId: 'p2', type: 'fertilizing', action: 'done', date: '2026-05-09', notes: '', createdAt: '' },
        { id: 'h2', taskId: 't2', plantId: 'p2', type: 'fertilizing', action: 'skipped', date: '2026-05-08', notes: '', createdAt: '' },
      ],
      waterings: [
        { id: 'w1', plantId: 'p1', date: '2026-05-10', amountMl: null, notes: '', createdAt: '' },
        { id: 'w2', plantId: 'p1', date: '2026-04-02', amountMl: null, notes: '', createdAt: '' },
      ],
      health: [{ id: 'he', plantId: 'p2', category: 'pests', description: '', observedOn: '2026-05-05', status: 'open', actions: [], photoPaths: [], notes: '', resolvedOn: null, createdAt: '' }],
    });
    expect(ins.totalPlants).toBe(2);
    expect(ins.favorites).toBe(1);
    expect(ins.byCategory).toHaveLength(2);
    expect(ins.wateringsLast30).toBe(1);
    expect(ins.tasksDoneLast30).toBe(1);
    expect(ins.overdueTasks).toBe(1);
    expect(ins.needingAttention.sort()).toEqual(['p1', 'p2']);
    expect(ins.careStreak).toBe(2);
    expect(ins.collectionGrowth.at(-1)).toEqual({ month: '2026-05', added: 1, total: 2 });
    expect(ins.monthlyCare.at(-1)).toEqual({ month: '2026-05', waterings: 1, tasks: 1 });
    expect(ins.regularity).toBeCloseTo(2 / 4);
  });

  it('returns null regularity when nothing was planned', () => {
    expect(computeInsights({ today: '2026-05-10', plants: [], tasks: [], history: [], waterings: [], health: [] }).regularity).toBeNull();
  });
});
