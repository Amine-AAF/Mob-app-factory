import { lessons } from '@/content';
import { gradeQuiz, renderPrompt } from '@/components/QuizRunner';
import type { LessonSummary } from '@/database/repositories/contentRepository';
import { dailyXpGoal } from '@/database/repositories/profileRepository';
import { canAccessLesson, continueLesson, recommendLessons, scoreLesson } from '@/features/learning/recommendations';
import { buildExercise, PRACTICE_MODES } from '@/features/practice/exercises';
import { FREE_DAILY_PRACTICE, grantBonus, remainingPractice } from '@/features/practice/limits';
import { monthGrid } from '@/features/progress/calendar';
import { evaluateAchievements } from '@/features/progress/achievements';

const summary = (l: (typeof lessons)[number], position: number): LessonSummary => ({
  id: l.id,
  moduleId: l.moduleId,
  topic: l.topic,
  position,
  title: l.title,
  titleTranslation: l.titleTranslation,
  level: l.level,
  premium: l.premium,
  minutes: l.estimatedMinutes,
  roles: l.roles,
  interviewPath: l.interview?.path ?? null,
});
const summaries = lessons.map(summary);

describe('recommendations', () => {
  const profile = { englishLevel: 'beginner' as const, role: 'devops' as const, objectives: ['interviews' as const], dailyMinutes: 10 as const };

  it('prefers level-appropriate, relevant, accessible lessons', () => {
    const recs = recommendLessons(summaries, profile, new Set(), false, 3);
    expect(recs).toHaveLength(3);
    expect(recs.every((l) => !l.premium)).toBe(true);
    expect(recs[0]!.level).not.toBe('advanced');
  });

  it('never recommends completed lessons', () => {
    const done = new Set(summaries.slice(0, 40).map((l) => l.id));
    expect(recommendLessons(summaries, profile, done, true, 10).some((l) => done.has(l.id))).toBe(false);
  });

  it('boosts lessons matching the role', () => {
    const devops = summaries.find((l) => l.roles.includes('devops') && l.level === 'intermediate')!;
    const other = summaries.find((l) => !l.roles.includes('devops') && !l.roles.includes('any') && l.level === 'intermediate' && l.moduleId === devops.moduleId);
    if (other) expect(scoreLesson(devops, { ...profile, englishLevel: 'intermediate' }, true)).toBeGreaterThan(scoreLesson(other, { ...profile, englishLevel: 'intermediate' }, true));
  });

  it('resumes the most recently started lesson', () => {
    const statuses = new Map([
      ['wp-01', { status: 'started' as const, updatedAt: '2026-01-01T10:00:00Z' }],
      ['wp-02', { status: 'started' as const, updatedAt: '2026-01-02T10:00:00Z' }],
      ['wp-03', { status: 'completed' as const, updatedAt: '2026-01-03T10:00:00Z' }],
    ]);
    expect(continueLesson(summaries, statuses)?.id).toBe('wp-02');
  });

  it('gates premium lessons', () => {
    expect(canAccessLesson({ premium: true }, false)).toBe(false);
    expect(canAccessLesson({ premium: true }, true)).toBe(true);
    expect(canAccessLesson({ premium: false }, false)).toBe(true);
  });

  it('derives a daily XP goal from minutes', () => {
    expect(dailyXpGoal(10)).toBe(100);
    expect(dailyXpGoal(1)).toBe(30);
  });
});

describe('quiz grading', () => {
  const quiz = lessons[0]!.quiz;
  it('scores answers and treats unanswered as wrong', () => {
    const allRight = Object.fromEntries(quiz.map((q) => [q.id, q.correctIndex]));
    expect(gradeQuiz(quiz, allRight).correct).toBe(quiz.length);
    expect(gradeQuiz(quiz, {}).correct).toBe(0);
  });
  it('renders fill-in prompts with a visible blank', () => {
    const fill = lessons.flatMap((l) => l.quiz).find((q) => q.type === 'fill')!;
    expect(renderPrompt(fill)).toContain('_____');
    expect(renderPrompt(fill, 'X')).toContain('“X”');
  });
});

describe('practice', () => {
  const fills = lessons.flatMap((l) => l.quiz.filter((q) => q.type === 'fill'));

  it.each(PRACTICE_MODES)('builds a %s exercise deterministically', (mode) => {
    const a = buildExercise(mode, lessons, fills, 7);
    expect(a).not.toBeNull();
    expect(buildExercise(mode, lessons, fills, 7)).toEqual(a);
  });

  it('listening exercises contain the spoken sentence exactly once', () => {
    for (let seed = 1; seed < 30; seed++) {
      const ex = buildExercise('listening', lessons, fills, seed);
      if (ex?.mode !== 'listening') throw new Error('expected listening');
      expect(ex.options[ex.correctIndex]).toBe(ex.audio);
      expect(new Set(ex.options).size).toBe(ex.options.length);
    }
  });

  it('honours the requested interview lesson', () => {
    const ex = buildExercise('interview', lessons, fills, 1, 'iv-07');
    expect(ex?.mode === 'interview' && ex.lessonId).toBe('iv-07');
  });

  it('limits free practice and adds rewarded bonuses for the day only', () => {
    expect(remainingPractice({ isPremium: false, doneToday: 0, bonus: null, today: '2026-01-01' })).toBe(FREE_DAILY_PRACTICE);
    expect(remainingPractice({ isPremium: false, doneToday: 9, bonus: null, today: '2026-01-01' })).toBe(0);
    const bonus = grantBonus(null, '2026-01-01');
    expect(remainingPractice({ isPremium: false, doneToday: 5, bonus, today: '2026-01-01' })).toBe(5);
    expect(remainingPractice({ isPremium: false, doneToday: 5, bonus, today: '2026-01-02' })).toBe(0);
    expect(remainingPractice({ isPremium: true, doneToday: 99, bonus: null, today: '2026-01-01' })).toBe(Infinity);
  });
});

describe('progress helpers', () => {
  it('builds a Monday-first month grid', () => {
    const grid = monthGrid('2026-11-13'); // November 2026 starts on a Sunday
    expect(grid.length % 7).toBe(0);
    expect(grid.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(grid[6]).toBe('2026-11-01');
    expect(grid.filter(Boolean)).toHaveLength(30);
  });

  it('evaluates achievements from stats', () => {
    const zero = { lessonsCompleted: 0, interviewLessonsCompleted: 0, perfectQuizzes: 0, currentStreak: 0, longestStreak: 0, wordsLearned: 0, cardsReviewed: 0, challengesCompleted: 0, speakingDone: 0, totalXp: 0 };
    expect(evaluateAchievements(zero)).toEqual([]);
    expect(evaluateAchievements({ ...zero, longestStreak: 7 })).toEqual(['streak_3', 'streak_7']);
  });
});
