import { createBackup, parseBackup, restoreBackup, wipeTables, type BackupFile, type SqlDatabase } from '@factory/storage';

import { SCHEMA_VERSION, USER_TABLES } from '@/database/migrations';
import type { MockAnswerRecord, SavedAnswer } from '@/database/repositories/practiceRepository';
import { composeAnswer } from '@/features/answer-builder/templates';

/**
 * Local backup, restore and deletion of the user's data. Backups are plain JSON files
 * the user saves or shares themself: nothing is uploaded by the app.
 */
export const APP_ID = 'interviewready';

export async function exportUserData(db: SqlDatabase, now = new Date()): Promise<{ json: string; fileName: string; backup: BackupFile }> {
  const backup = await createBackup(db, { appId: APP_ID, tables: USER_TABLES, now });
  const stamp = now.toISOString().slice(0, 10);
  return { json: JSON.stringify(backup, null, 2), fileName: `interviewready-backup-${stamp}.json`, backup };
}

/** Restores a backup atomically. Parents are listed before children in USER_TABLES, so foreign keys hold. */
export async function importUserData(db: SqlDatabase, raw: string): Promise<{ restoredRows: number }> {
  const backup = parseBackup(raw, APP_ID);
  return restoreBackup(db, backup, { tables: USER_TABLES, currentSchemaVersion: SCHEMA_VERSION });
}

/** Erases every user-owned row (children first). Bundled content is not personal data and stays. */
export async function deleteAllUserData(db: SqlDatabase): Promise<void> {
  await wipeTables(db, [...[...USER_TABLES].reverse(), 'subscription_cache']);
}

export interface AnswersExportLabels {
  title: string;
  builderSection: string;
  mockSection: string;
  question: (id: string) => string;
  skipped: string;
  notes: string;
}

/**
 * Human-readable export of the user's own answers (Answer Builder and mock interviews),
 * so they can review or print them before an interview.
 */
export function formatAnswersExport(
  input: { answers: readonly SavedAnswer[]; mocks: readonly { startedAt: string; answers: readonly MockAnswerRecord[] }[] },
  labels: AnswersExportLabels,
): string {
  const lines: string[] = [`# ${labels.title}`, ''];
  if (input.answers.length) {
    lines.push(`## ${labels.builderSection}`, '');
    for (const a of input.answers) {
      lines.push(`### ${a.title}`, '', composeAnswer(a.structure, a.fields) || '-', '');
    }
  }
  const answeredMocks = input.mocks.filter((m) => m.answers.some((a) => a.answer.trim() || a.notes.trim()));
  if (answeredMocks.length) {
    lines.push(`## ${labels.mockSection}`, '');
    for (const m of answeredMocks) {
      lines.push(`### ${m.startedAt.slice(0, 10)}`, '');
      for (const a of m.answers) {
        lines.push(`**${labels.question(a.questionId)}**`, '', a.skipped || !a.answer.trim() ? labels.skipped : a.answer.trim(), '');
        if (a.notes.trim()) lines.push(`_${labels.notes}: ${a.notes.trim()}_`, '');
      }
    }
  }
  return lines.join('\n').trimEnd() + '\n';
}
