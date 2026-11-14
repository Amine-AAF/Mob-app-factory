import { FREE_LIMITS } from '@/constants/limits';
import { questionCore } from '@/content';
import { repos } from '@/database';
import type { QuizMode } from '@/database/repositories/reviewRepository';
import { gradeFromAnswer, nextCard, scoreAnswers, type QuizScore, type RoundAnswer } from '@/features/quizzes/engine';
import { useSession } from '@/store/session';

import { countActivityForAds } from './ads';
import { track } from './analytics';
import { clock } from './clock';

/**
 * User actions on the library. Screens call these instead of repositories so that
 * limits, activity counters, analytics and UI refresh stay consistent.
 * Analytics only receive bundled content ids and categories, never user text.
 */

export type FavoriteResult = 'added' | 'removed' | 'limit-reached';

const bump = () => useSession.getState().bump();

export async function viewQuestion(id: string): Promise<void> {
  await repos().library.recordView(id);
  const core = questionCore(id);
  if (core) track('question_viewed', { question_id: id, category: core.category });
}

export async function toggleFavorite(id: string, isPremium: boolean): Promise<FavoriteResult> {
  const lib = repos().library;
  if (await lib.isFavorite(id)) {
    await lib.setFavorite(id, false);
    bump();
    return 'removed';
  }
  if (!isPremium && (await lib.favoriteCount()) >= FREE_LIMITS.favorites) return 'limit-reached';
  await lib.setFavorite(id, true);
  bump();
  return 'added';
}

export async function setStudied(id: string, studied: boolean, isDaily = false): Promise<void> {
  const first = await repos().library.markStudied(id, studied);
  if (isDaily && studied) await repos().library.markDailyStudied(clock.today());
  if (first) {
    await repos().activity.increment('questions_studied');
    const core = questionCore(id);
    if (core) track('question_completed', { question_id: id, category: core.category });
  }
  bump();
}

export async function saveNote(id: string, body: string): Promise<void> {
  await repos().library.saveNote(id, body);
  bump();
}

/** Saves a finished quiz, updates spaced repetition and activity, and returns the score. */
export async function finishQuiz(input: { mode: QuizMode; category: string | null; startedAt: string; answers: readonly RoundAnswer[] }): Promise<QuizScore> {
  const { review, activity } = repos();
  await review.saveAttempt(input);
  const today = clock.today();
  const cards = await review.getCards(
    'quiz',
    input.answers.map((a) => a.itemId),
  );
  for (const a of input.answers) {
    await review.saveCard('quiz', a.itemId, nextCard(cards.get(a.itemId), gradeFromAnswer(a.correct), today), !a.correct);
  }
  await activity.increment('quizzes_completed');
  const score = scoreAnswers(input.answers);
  track('quiz_completed', { mode: input.mode, score: score.correct, total: score.total });
  countActivityForAds();
  bump();
  return score;
}
