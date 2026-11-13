import { addDays, computeStreak, dayIndex, diffDays, isDue, lastNDays, levelFromXp, newCard, reviewCard, scorePercent, seededShuffle, startOfWeek, toDayKey, xpForLevel } from '../index';

describe('dates', () => {
  it('formats local day keys with zero padding', () => {
    expect(toDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29'); // leap year
  });

  it('is DST-safe when diffing days', () => {
    // Europe DST change on the last Sunday of March / October.
    expect(diffDays('2026-03-28', '2026-03-30')).toBe(2);
    expect(diffDays('2026-10-24', '2026-10-26')).toBe(2);
  });

  it('returns the last N days oldest first', () => {
    expect(lastNDays('2026-03-03', 3)).toEqual(['2026-03-01', '2026-03-02', '2026-03-03']);
  });

  it('computes Monday as start of week (also for Sundays)', () => {
    expect(startOfWeek('2026-11-13')).toBe('2026-11-09'); // Friday
    expect(startOfWeek('2026-11-15')).toBe('2026-11-09'); // Sunday
    expect(startOfWeek('2026-11-09')).toBe('2026-11-09'); // Monday
  });

  it('dayIndex is deterministic', () => {
    expect(dayIndex('2026-01-01')).toBe(0);
    expect(dayIndex('2026-01-15')).toBe(14);
  });
});

describe('streaks', () => {
  it('is zero with no activity', () => {
    expect(computeStreak([], '2026-05-10')).toEqual({ current: 0, longest: 0 });
  });

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-05-08', '2026-05-09', '2026-05-10'], '2026-05-10').current).toBe(3);
  });

  it('keeps the streak alive if yesterday was active but not yet today', () => {
    expect(computeStreak(['2026-05-08', '2026-05-09'], '2026-05-10').current).toBe(2);
  });

  it('breaks after a missed day', () => {
    expect(computeStreak(['2026-05-07', '2026-05-08'], '2026-05-10').current).toBe(0);
  });

  it('ignores duplicates and future days and tracks the longest run', () => {
    const s = computeStreak(['2026-05-01', '2026-05-02', '2026-05-02', '2026-05-03', '2026-05-09', '2026-05-10', '2026-06-01'], '2026-05-10');
    expect(s).toEqual({ current: 2, longest: 3 });
  });
});

describe('levels', () => {
  it('uses an increasing curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
  });

  it('derives level and progress from XP', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, xpIntoLevel: 0, xpForNext: 100 });
    expect(levelFromXp(150)).toMatchObject({ level: 2, xpIntoLevel: 50, xpForNext: 200, progress: 0.25 });
    expect(levelFromXp(-20).level).toBe(1);
  });

  it('scores quizzes as rounded percentages', () => {
    expect(scorePercent(2, 3)).toBe(67);
    expect(scorePercent(5, 3)).toBe(100);
    expect(scorePercent(0, 0)).toBe(0);
  });
});

describe('spaced repetition', () => {
  it('schedules new cards progressively', () => {
    const c1 = reviewCard(newCard('2026-01-01'), 2, '2026-01-01');
    expect(c1).toMatchObject({ repetitions: 1, intervalDays: 1, dueDay: '2026-01-02' });
    const c2 = reviewCard(c1, 2, '2026-01-02');
    expect(c2.intervalDays).toBe(6);
    const c3 = reviewCard(c2, 2, '2026-01-08');
    expect(c3.intervalDays).toBeGreaterThan(6);
  });

  it('resets on "again" and never drops ease below the minimum', () => {
    let c = newCard('2026-01-01');
    for (let i = 0; i < 20; i++) c = reviewCard(c, 0, '2026-01-01');
    expect(c.repetitions).toBe(0);
    expect(c.intervalDays).toBe(1);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('knows when a card is due', () => {
    expect(isDue({ ...newCard('2026-01-01'), dueDay: '2026-01-03' }, '2026-01-02')).toBe(false);
    expect(isDue({ ...newCard('2026-01-01'), dueDay: '2026-01-03' }, '2026-01-03')).toBe(true);
  });
});

describe('seededShuffle', () => {
  it('is deterministic and a permutation', () => {
    const a = seededShuffle([1, 2, 3, 4, 5], 42);
    expect(seededShuffle([1, 2, 3, 4, 5], 42)).toEqual(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
