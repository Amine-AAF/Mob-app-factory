import type { SqlDatabase } from '@factory/storage';

import { clock } from '@/services/clock';

export type ActivityCounter = 'questions_studied' | 'quizzes_completed' | 'mocks_completed' | 'cards_reviewed' | 'answers_saved';

const COUNTERS: readonly ActivityCounter[] = ['questions_studied', 'quizzes_completed', 'mocks_completed', 'cards_reviewed', 'answers_saved'];

export interface DayActivity {
  day: string;
  questionsStudied: number;
  quizzesCompleted: number;
  mocksCompleted: number;
  cardsReviewed: number;
  answersSaved: number;
}

export function createActivityRepository(db: SqlDatabase) {
  return {
    async increment(counter: ActivityCounter, by = 1): Promise<void> {
      // Column name comes from a closed list, never from user input.
      if (!COUNTERS.includes(counter)) throw new Error(`Unknown counter ${counter}`);
      await db.runAsync(
        `INSERT INTO daily_activity (day, ${counter}, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(day) DO UPDATE SET ${counter} = ${counter} + excluded.${counter}, updated_at = excluded.updated_at`,
        [clock.today(), by, clock.now().toISOString()],
      );
    },

    async activeDays(): Promise<string[]> {
      const rows = await db.getAllAsync<{ day: string }>('SELECT day FROM daily_activity ORDER BY day', []);
      return rows.map((r) => r.day);
    },

    async range(fromDay: string, toDay: string): Promise<DayActivity[]> {
      const rows = await db.getAllAsync<{
        day: string;
        questions_studied: number;
        quizzes_completed: number;
        mocks_completed: number;
        cards_reviewed: number;
        answers_saved: number;
      }>('SELECT * FROM daily_activity WHERE day BETWEEN ? AND ? ORDER BY day', [fromDay, toDay]);
      return rows.map((r) => ({
        day: r.day,
        questionsStudied: r.questions_studied,
        quizzesCompleted: r.quizzes_completed,
        mocksCompleted: r.mocks_completed,
        cardsReviewed: r.cards_reviewed,
        answersSaved: r.answers_saved,
      }));
    },
  };
}
