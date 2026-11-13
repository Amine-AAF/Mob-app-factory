import { toJson, type SqlDatabase } from '@factory/storage';

import { CONTENT_VERSION, dailyChallenges, lessons, modules, vocabulary, type QuizQuestion } from '@/content';

import { CONTENT_TABLES } from './migrations';

async function insertQuiz(db: SqlDatabase, ownerType: 'lesson' | 'challenge', ownerId: string, questions: QuizQuestion[]) {
  for (const [qi, q] of questions.entries()) {
    await db.runAsync(
      'INSERT INTO quiz_questions (id, owner_type, owner_id, position, type, prompt, explanation, correct_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [q.id, ownerType, ownerId, qi, q.type, q.prompt, q.explanation, q.correctIndex],
    );
    for (const [ai, text] of q.options.entries()) {
      await db.runAsync('INSERT INTO quiz_answers (question_id, position, text) VALUES (?, ?, ?)', [q.id, ai, text]);
    }
  }
}

/**
 * Seeds (or re-seeds) bundled content when CONTENT_VERSION changes.
 * Runs in a single transaction: either the new content is fully there or the old one stays.
 * Returns true when a seed happened.
 */
export async function seedContentIfNeeded(db: SqlDatabase, version = CONTENT_VERSION): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM content_meta WHERE key = 'content_version'", []);
  if (row && Number(row.value) === version) return false;

  await db.withTransactionAsync(async () => {
    for (const table of CONTENT_TABLES) await db.runAsync(`DELETE FROM ${table}`, []);

    for (const m of modules) {
      await db.runAsync('INSERT INTO learning_modules (id, position, icon) VALUES (?, ?, ?)', [m.id, m.position, m.icon]);
    }

    for (const [i, l] of lessons.entries()) {
      await db.runAsync(
        'INSERT INTO lessons (id, module_id, topic, position, title, title_translation, level, premium, minutes, roles, interview_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [l.id, l.moduleId, l.topic, i, l.title, toJson(l.titleTranslation), l.level, l.premium ? 1 : 0, l.estimatedMinutes, toJson(l.roles), l.interview?.path ?? null],
      );
      const sections: [string, unknown][] = [
        ['overview', { objective: l.objective, objectiveTranslation: l.objectiveTranslation, situation: l.situation, situationTranslation: l.situationTranslation }],
        ['vocabulary', l.vocabulary],
        ['expressions', l.expressions],
        ['dialogue', l.dialogue],
      ];
      if (l.interview) sections.push(['interview', l.interview]);
      for (const [pos, [kind, payload]] of sections.entries()) {
        await db.runAsync('INSERT INTO lesson_sections (lesson_id, kind, position, payload) VALUES (?, ?, ?, ?)', [l.id, kind, pos, toJson(payload)]);
      }
      await insertQuiz(db, 'lesson', l.id, l.quiz);
    }

    for (const v of vocabulary) {
      await db.runAsync(
        'INSERT INTO vocabulary (id, term, term_lower, definition, translation, example, category, difficulty, pronounceable, premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [v.id, v.term, v.term.toLowerCase(), v.definition, toJson(v.translation), v.example, v.category, v.difficulty, v.pronounceable ? 1 : 0, v.premium ? 1 : 0],
      );
    }

    for (const [i, c] of dailyChallenges.entries()) {
      const { quiz, ...rest } = c;
      await db.runAsync('INSERT INTO daily_challenges (id, position, payload) VALUES (?, ?, ?)', [c.id, i, toJson(rest)]);
      await insertQuiz(db, 'challenge', c.id, [quiz]);
    }

    await db.runAsync("INSERT OR REPLACE INTO content_meta (key, value) VALUES ('content_version', ?)", [String(version)]);
  });
  return true;
}
