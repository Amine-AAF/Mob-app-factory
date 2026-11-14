import { toJson, type SqlDatabase } from '@factory/storage';

import { CONTENT_VERSION, QUIZ_BANKS } from '@/content';
import { TEMPLATES } from '@/content/templates';
import { clock } from '@/services/clock';

import { questionPayload } from './repositories/quiz';

/**
 * Seeds bundled content when CONTENT_VERSION changes. Runs in one transaction and only
 * replaces rows with source = 'bundle': user questions, user templates and quiz attempts are
 * never touched (attempts reference questions by id inside JSON, not by foreign key).
 */
export async function seedContentIfNeeded(db: SqlDatabase, force = false): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM app_meta WHERE key = 'content_version'", []);
  if (!force && row && Number(row.value) === CONTENT_VERSION) return false;
  const t = clock.now().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM quiz_questions WHERE source = 'bundle'", []);
    for (const bank of QUIZ_BANKS) {
      for (const q of bank.questions) {
        await db.runAsync(
          "INSERT INTO quiz_questions (id, bank_id, subject_id, source, type, difficulty, prompt, payload, explanation, tags, created_at, updated_at) VALUES (?, ?, NULL, 'bundle', ?, ?, ?, ?, ?, ?, ?, ?)",
          [q.id, bank.id, q.type, q.difficulty, q.prompt, toJson(questionPayload(q)), q.explanation, toJson(q.tags ?? []), t, t],
        );
      }
    }
    await db.runAsync("DELETE FROM templates WHERE source = 'bundle'", []);
    for (const tpl of TEMPLATES) {
      await db.runAsync("INSERT INTO templates (id, source, category, premium, payload, created_at, updated_at) VALUES (?, 'bundle', ?, ?, ?, ?, ?)", [tpl.id, tpl.category, tpl.premium ? 1 : 0, toJson(tpl), t, t]);
    }
    await db.runAsync("INSERT INTO app_meta (key, value) VALUES ('content_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [String(CONTENT_VERSION)]);
  });
  return true;
}
