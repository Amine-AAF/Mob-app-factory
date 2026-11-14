import { findDuplicate } from '@/features/library/duplicates';
import { checkDuration, elapsedSec, pauseTimer, resumeTimer, sessionPages, validateManualSession } from '@/features/sessions/timer';
import { applyStatus, audioRatio, audioRemainingSeconds, progressPercent, ProgressError, statusAfterPageUpdate, validateDates, validatePage } from '@/features/tracking/progress';
import { assertWithinLimit, LimitReachedError, remainingQuota } from '@/config/limits';
import { isbnTo13, isDayKey, normalizeIsbn, normalizeKey, parseDuration, parseHoursMinutes, parseMoneyToCents } from '@/utils';

describe('text keys & identifiers', () => {
  it('normalizes titles regardless of case, accents and punctuation', () => {
    expect(normalizeKey('  Le Petit-Prince !')).toBe(normalizeKey('le petit prince'));
    expect(normalizeKey('Cien Años')).toBe('cien anos');
  });

  it('validates ISBN-10/13 checksums and converts 10 → 13', () => {
    expect(normalizeIsbn('0-306-40615-2')).toBe('0306406152');
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157');
    expect(normalizeIsbn('978-0-306-40615-8')).toBeNull();
    expect(normalizeIsbn('080442957X')).toBe('080442957X');
    expect(normalizeIsbn('')).toBeNull();
    expect(isbnTo13('0306406152')).toBe('9780306406157');
  });

  it('parses money, durations and days strictly', () => {
    expect(parseMoneyToCents('12,5')).toBe(1250);
    expect(parseMoneyToCents('12.345')).toBeNull();
    expect(parseMoneyToCents('abc')).toBeNull();
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('45')).toBe(2700);
    expect(parseDuration('1:75:00')).toBeNull();
    expect(parseHoursMinutes('1:30')).toBe(5400);
    expect(parseHoursMinutes('1:75')).toBeNull();
    expect(isDayKey('2026-02-29')).toBe(false);
    expect(isDayKey('2028-02-29')).toBe(true);
  });
});

describe('progress rules', () => {
  it('never reports a percentage without a page count', () => {
    expect(progressPercent(50, 200)).toBe(25);
    expect(progressPercent(50, null)).toBeNull();
    expect(progressPercent(50, 0)).toBeNull();
    expect(audioRatio(10, null)).toBeNull();
    expect(audioRemainingSeconds(3600, 7200, 2)).toBe(1800);
  });

  it('rejects inconsistent pages and dates', () => {
    expect(() => validatePage(-1, 100)).toThrow(ProgressError);
    expect(() => validatePage(101, 100)).toThrow(ProgressError);
    expect(() => validatePage(1.5, 100)).toThrow(ProgressError);
    expect(validatePage(400, null)).toBe(400);
    expect(() => validateDates('2026-11-10', '2026-11-01', '2026-11-13')).toThrow(ProgressError);
    expect(() => validateDates('2026-12-01', null, '2026-11-13')).toThrow(ProgressError);
  });

  it('applies status side effects without inventing data', () => {
    const base = { status: 'want_to_read' as const, startedOn: null, finishedOn: null, currentPage: 0 };
    expect(applyStatus(base, 'reading', 100, '2026-11-13')).toMatchObject({ startedOn: '2026-11-13', finishedOn: null });
    expect(applyStatus(base, 'completed', 100, '2026-11-13')).toMatchObject({ startedOn: null, finishedOn: '2026-11-13', currentPage: 100 });
    expect(applyStatus({ ...base, status: 'completed', startedOn: '2026-11-01', finishedOn: '2026-11-05', currentPage: 100 }, 'reading', 100, '2026-11-13')).toMatchObject({ finishedOn: null, startedOn: '2026-11-01' });
    expect(statusAfterPageUpdate('want_to_read', 10, 100)).toBe('reading');
    expect(statusAfterPageUpdate('reading', 100, 100)).toBe('completed');
    expect(statusAfterPageUpdate('abandoned', 10, 100)).toBe('abandoned');
  });
});

describe('session timer', () => {
  const t0 = { bookId: 'b', startedAt: '2026-11-13T10:00:00.000Z', pausedAt: null, pausedMs: 0, startPage: 0, startPositionSec: null };

  it('excludes paused time and is idempotent on double pause/resume', () => {
    let t = pauseTimer(t0, new Date('2026-11-13T10:10:00Z'));
    expect(pauseTimer(t, new Date('2026-11-13T10:20:00Z'))).toBe(t);
    expect(elapsedSec(t, new Date('2026-11-13T12:00:00Z'))).toBe(600);
    t = resumeTimer(t, new Date('2026-11-13T10:30:00Z'));
    expect(resumeTimer(t, new Date('2026-11-13T10:31:00Z'))).toBe(t);
    expect(elapsedSec(t, new Date('2026-11-13T10:40:00Z'))).toBe(1200);
  });

  it('never goes negative if the device clock moves backwards', () => {
    expect(elapsedSec(t0, new Date('2026-11-13T09:00:00Z'))).toBe(0);
  });

  it('flags implausible durations and validates manual sessions', () => {
    expect(checkDuration(10)).toBe('too_short');
    expect(checkDuration(9 * 3600)).toBe('too_long');
    expect(checkDuration(1800)).toBe('ok');
    const now = new Date('2026-11-13T12:00:00Z');
    expect(validateManualSession({ startedAt: new Date('2026-11-13T10:00:00Z'), endedAt: new Date('2026-11-13T10:45:00Z'), startPage: null, endPage: null }, now, null)).toBe(2700);
    expect(sessionPages(10, null)).toBeNull();
    expect(sessionPages(10, 25)).toBe(15);
  });
});

describe('duplicates', () => {
  const lib = [
    { id: 'a', title: 'Dune', authorName: 'Frank Herbert', isbn: '9780441172719' },
    { id: 'b', title: 'Emma', authorName: null, isbn: null },
  ];
  it('treats different ISBNs of the same title as different editions', () => {
    expect(findDuplicate({ title: 'Dune', authorName: 'Frank Herbert', isbn: '9780306406157' }, lib)).toBeNull();
  });
  it('flags title-only matches when an author is missing', () => {
    expect(findDuplicate({ title: 'emma', authorName: 'Jane Austen' }, lib)).toEqual({ id: 'b', reason: 'title' });
  });
});

describe('free limits', () => {
  it('blocks additions over the limit only for free users', () => {
    expect(() => assertWithinLimit('books', 100, false)).toThrow(LimitReachedError);
    expect(() => assertWithinLimit('books', 99, false)).not.toThrow();
    expect(() => assertWithinLimit('books', 5000, true)).not.toThrow();
    expect(remainingQuota('quotes', 90, false)).toBe(10);
    expect(remainingQuota('quotes', 90, true)).toBe(Infinity);
  });
});
