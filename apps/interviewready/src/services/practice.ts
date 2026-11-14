import type { ReviewGrade } from '@factory/app-core';

import { FREE_LIMITS, PremiumRequiredError } from '@/constants/limits';
import { allQuestionCores } from '@/content';
import { repos } from '@/database';
import type { SavedAnswer } from '@/database/repositories/practiceRepository';
import { bonusMocksToday } from '@/features/ads/policy';
import { generatePlan, type PathLength } from '@/features/learning-path/plan';
import { averageRating, selectMockQuestions, summarizeMock, type MockAnswerInput, type MockDuration, type MockSummary } from '@/features/mock-interview/session';
import { nextCard } from '@/features/quizzes/engine';
import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';
import type { Difficulty, JobRoleId } from '@/types/content';

import { countActivityForAds } from './ads';
import { track } from './analytics';
import { clock } from './clock';

const bump = () => useSession.getState().bump();

/** Free users get one mock interview per day, plus bonus sessions unlocked by rewarded ads (Phase 6). */
export async function remainingFreeMocks(): Promise<number> {
  const today = clock.today();
  const used = await repos().practice.mocksStartedOn(today);
  const extra = bonusMocksToday(usePreferences.getState().bonusMocks, today);
  return Math.max(0, FREE_LIMITS.mockInterviewsPerDay + extra - used);
}

export type StartMockResult = { status: 'started'; sessionId: number; questionIds: string[] } | { status: 'limit-reached' } | { status: 'no-questions' };

export async function startMockInterview(input: {
  role: JobRoleId | null;
  level: Difficulty;
  minutes: MockDuration;
  timerEnabled: boolean;
  isPremium: boolean;
}): Promise<StartMockResult> {
  if (!input.isPremium && (await remainingFreeMocks()) <= 0) return { status: 'limit-reached' };
  const questionIds = selectMockQuestions({
    cores: allQuestionCores(),
    role: input.role,
    level: input.level,
    minutes: input.minutes,
    includePremium: input.isPremium,
    seed: clock.now().getTime() % 2_147_483_647,
  });
  if (!questionIds.length) return { status: 'no-questions' };
  const sessionId = await repos().practice.startMock({
    jobRole: input.role ?? 'general',
    level: input.level,
    minutes: input.minutes,
    timerEnabled: input.timerEnabled,
    questionIds,
  });
  track('mock_interview_started', { job_role: input.role ?? 'general', level: input.level, minutes: input.minutes });
  bump();
  return { status: 'started', sessionId, questionIds };
}

/** Saves self-assessments, completes the session and returns its summary. */
export async function finishMockInterview(sessionId: number, answers: readonly (MockAnswerInput & { notes: string; secondsSpent: number })[], role: string): Promise<MockSummary> {
  const { practice, activity } = repos();
  for (const [position, a] of answers.entries()) {
    await practice.saveMockAnswer(sessionId, { position, answer: a.answer, notes: a.notes, skipped: a.skipped, secondsSpent: a.secondsSpent, rating: a.rating ?? null });
  }
  const summary = summarizeMock(answers);
  await practice.completeMock(sessionId, summary.averageScore, null);
  await activity.increment('mocks_completed');
  // Only counts are sent: never the answers or notes.
  track('mock_interview_completed', { job_role: role, answered: summary.answered, total: summary.total });
  countActivityForAds();
  bump();
  return summary;
}

export { averageRating };

export async function gradeFlashcard(questionId: string, grade: ReviewGrade): Promise<void> {
  const { review, activity } = repos();
  const cards = await review.getCards('question', [questionId]);
  await review.saveCard('question', questionId, nextCard(cards.get(questionId), grade, clock.today()), grade === 0);
  await activity.increment('cards_reviewed');
  bump();
}

export async function saveBuilderAnswer(input: Omit<SavedAnswer, 'id' | 'updatedAt'> & { id?: number }): Promise<number> {
  const id = await repos().practice.saveAnswer(input);
  if (!input.id) await repos().activity.increment('answers_saved');
  bump();
  return id;
}

export async function createLearningPath(input: { role: JobRoleId | null; level: Difficulty; goal: string; length: PathLength; isPremium: boolean }): Promise<number> {
  if (!input.isPremium && input.length > FREE_LIMITS.pathMaxDays) throw new PremiumRequiredError('path_length');
  const plan = generatePlan({ cores: allQuestionCores(), role: input.role, level: input.level, length: input.length, includePremium: input.isPremium });
  const id = await repos().practice.createPath({
    jobRole: input.role ?? 'general',
    level: input.level,
    goal: input.goal,
    days: input.length,
    startDay: clock.today(),
    plan,
  });
  bump();
  return id;
}

export async function setPathTask(pathId: number, dayIndex: number, taskId: string, done: boolean, allDoneAfter: boolean): Promise<void> {
  await repos().practice.setTaskDone(pathId, dayIndex, taskId, done);
  await repos().practice.setPathStatus(pathId, allDoneAfter ? 'completed' : 'active');
  bump();
}
