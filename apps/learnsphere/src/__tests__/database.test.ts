import { addDays } from '@factory/app-core';
import { createTestDatabase } from '@factory/testing';
import fs from 'fs';
import path from 'path';

import { QUIZ_BANKS } from '@/content';
import { TEMPLATES } from '@/content/templates';
import { initDatabase, withNestedTransactions, type Repositories } from '@/database';
import { SCHEMA_VERSION } from '@/database/migrations';
import { seedContentIfNeeded } from '@/database/seed';
import { applyTemplate, defaultCustomization } from '@/features/courses/applyTemplate';
import { deleteAllUserData, exportUserData, importUserData } from '@/services/backup';
import { clock } from '@/services/clock';

const NOW = new Date(2026, 10, 13, 12, 0);
const TODAY = '2026-11-13';
const subject = { name: 'Biology', description: 'Cells', color: '#27AE60', icon: 'leaf', objective: 'Pass', startDay: TODAY, targetDay: '2027-01-31' };

async function setup(): Promise<Repositories> {
  return initDatabase(await createTestDatabase());
}

beforeEach(() => clock.set(() => new Date(NOW)));
afterEach(() => clock.set(null));

describe('schema, migrations and seeding', () => {
  it('migrates to the latest version and seeds the quiz banks and templates', async () => {
    const r = await setup();
    const v = await r.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(v?.user_version).toBe(SCHEMA_VERSION);
    const counts = await r.quiz.bankCounts();
    for (const bank of QUIZ_BANKS) expect(counts[bank.id]).toBe(bank.questions.length);
    expect((await r.templates.list()).length).toBe(TEMPLATES.length);
  });

  it('is idempotent and enforces foreign keys', async () => {
    const db = await createTestDatabase();
    await initDatabase(db);
    const r = await initDatabase(db);
    expect(await seedContentIfNeeded(db)).toBe(false);
    expect((await r.quiz.bankCounts()).math).toBe(QUIZ_BANKS.find((b) => b.id === 'math')!.questions.length);
    await expect(r.db.runAsync("INSERT INTO courses (id, subject_id, title, created_at, updated_at) VALUES ('c', 'missing', 't', 'x', 'x')", [])).rejects.toThrow();
  });

  it('re-seeding bundled content keeps user questions and attempts', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    await r.quiz.saveUserQuestion(sid, { id: 'draft', type: 'true_false', difficulty: 1, prompt: 'Cells have membranes?', explanation: 'Yes.', correct: true });
    await r.quiz.saveAttempt({ bankId: 'math', subjectId: null, mode: 'practice', startedAt: NOW.toISOString(), finishedAt: NOW.toISOString(), day: TODAY, durationMs: 1000, timeLimitS: null, total: 1, correct: 1, score: 100, answers: [] });
    expect(await seedContentIfNeeded(r.db, true)).toBe(true);
    expect(await r.quiz.countUserQuestions()).toBe(1);
    expect(await r.quiz.attempts()).toHaveLength(1);
  });

  it('declares indexes on hot query paths', async () => {
    const r = await setup();
    const idx = (await r.db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'index'", [])).map((i) => i.name);
    expect(idx).toEqual(expect.arrayContaining(['idx_flashcards_due', 'idx_sessions_day', 'idx_study_log_day', 'idx_notes_subject', 'idx_reviews_card', 'idx_chapters_course']));
  });

  it('nested transactions join the outer one and roll back together', async () => {
    const raw = await createTestDatabase();
    const db = withNestedTransactions(raw);
    await db.execAsync('CREATE TABLE t (v INTEGER)');
    await expect(
      db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO t VALUES (1)', []);
        await db.withTransactionAsync(async () => db.runAsync('INSERT INTO t VALUES (2)', []).then(() => undefined));
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(await db.getAllAsync('SELECT * FROM t', [])).toEqual([]);
  });
});

describe('subjects and course organisation', () => {
  it('creates, searches, favours, archives and deletes subjects', async () => {
    const r = await setup();
    const a = await r.subjects.create(subject);
    const b = await r.subjects.create({ ...subject, name: 'Spanish', description: 'Vocabulary' });
    expect((await r.subjects.list('active', 'span')).map((s) => s.id)).toEqual([b]);
    expect((await r.subjects.list('active', 'cells')).map((s) => s.id)).toEqual([a]);
    await r.subjects.setFavorite(b, true);
    expect((await r.subjects.list('active'))[0]?.id).toBe(b);
    expect((await r.subjects.list('favorites')).map((s) => s.id)).toEqual([b]);
    await r.subjects.setArchived(b, true);
    expect(await r.subjects.countActive()).toBe(1);
    expect((await r.subjects.list('archived'))[0]).toMatchObject({ id: b, favorite: false });
    await r.subjects.remove(a);
    expect(await r.subjects.get(a)).toBeNull();
  });

  it('organises courses → chapters → lessons with progress and reordering', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    const cid = await r.subjects.createCourse(sid, 'Cell biology');
    const ch1 = await r.subjects.createChapter(cid, 'Membranes');
    const ch2 = await r.subjects.createChapter(cid, 'Organelles', 'module');
    const ch3 = await r.subjects.createChapter(cid, 'Division');
    await r.subjects.moveChapter(cid, ch3, -1);
    expect((await r.subjects.listChapters(cid)).map((c) => c.id)).toEqual([ch1, ch3, ch2]);
    await r.subjects.moveChapter(cid, ch1, -1); // already first: no-op
    expect((await r.subjects.listChapters(cid))[0]?.id).toBe(ch1);

    const l1 = await r.subjects.createLesson(ch1, 'Lipids');
    const l2 = await r.subjects.createLesson(ch1, 'Proteins');
    await r.subjects.setLessonDone(l1, true);
    expect((await r.subjects.listChapters(cid))[0]?.completedAt).toBeNull();
    await r.subjects.setLessonDone(l2, true);
    expect((await r.subjects.listChapters(cid))[0]?.completedAt).not.toBeNull();
    const s = await r.subjects.get(sid);
    expect(s).toMatchObject({ chapters: 3, chaptersDone: 1, courses: 1 });
    expect(s?.progress).toBeCloseTo(1 / 3);
    await r.subjects.setLessonDone(l2, false);
    expect((await r.subjects.get(sid))?.chaptersDone).toBe(0);
    expect((await r.subjects.coursesInProgress()).map((c) => c.id)).toEqual([cid]);
  });

  it('cascades deletes but keeps notes and flashcards unassigned', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    const cid = await r.subjects.createCourse(sid, 'C');
    const ch = await r.subjects.createChapter(cid, 'Ch');
    const note = await r.notes.create({ subjectId: sid, chapterId: ch, title: 'N', body: 'b', tags: [] });
    const card = await r.flashcards.create({ subjectId: sid, chapterId: ch, front: 'f', back: 'b', tags: [], difficulty: 'medium' });
    await r.planner.createSession({ subjectId: sid, title: 'S', goal: '', day: TODAY, startMinute: 600, durationMin: 30 });
    await r.subjects.addResource({ subjectId: sid, courseId: cid, kind: 'link', title: 'Site', uri: 'https://example.org', sizeBytes: null });
    await r.subjects.remove(sid);
    expect(await r.notes.get(note)).toMatchObject({ subjectId: null, chapterId: null });
    expect(await r.flashcards.get(card)).toMatchObject({ subjectId: null, chapterId: null });
    expect(await r.planner.sessionsBetween(TODAY, TODAY)).toHaveLength(0);
    expect(await r.db.getAllAsync('SELECT * FROM resources', [])).toHaveLength(0);
  });
});

describe('notes', () => {
  it('creates, searches by text and tag, and lists tags', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    await r.notes.create({ subjectId: sid, chapterId: null, title: 'Photosynthèse', body: '# Light\n- ==Chlorophyll== absorbs light', tags: ['plants', 'exam'] });
    await r.notes.create({ subjectId: null, chapterId: null, title: 'Grocery', body: 'milk', tags: [] });
    expect((await r.notes.list({ query: 'photosynthese' })).map((n) => n.title)).toEqual(['Photosynthèse']);
    expect((await r.notes.list({ query: 'CHLOROPHYLL' }))).toHaveLength(1);
    expect((await r.notes.list({ query: '%' }))).toHaveLength(0);
    expect((await r.notes.list({ tag: 'exam' }))).toHaveLength(1);
    expect((await r.notes.list({ subjectId: sid }))).toHaveLength(1);
    expect(await r.notes.allTags()).toEqual(['exam', 'plants']);
  });

  it('keeps a capped, throttled modification history and restores versions', async () => {
    const r = await setup();
    const id = await r.notes.create({ subjectId: null, chapterId: null, title: 'T', body: 'v1', tags: [] });
    await r.notes.update(id, { subjectId: null, chapterId: null, title: 'T', body: 'v2', tags: [] });
    // Autosave a few seconds later: no extra revision.
    clock.set(() => new Date(NOW.getTime() + 10_000));
    await r.notes.update(id, { subjectId: null, chapterId: null, title: 'T', body: 'v3', tags: [] });
    expect((await r.notes.revisions(id)).map((v) => v.body)).toEqual(['v1']);
    for (let i = 0; i < 30; i++) {
      clock.set(() => new Date(NOW.getTime() + (i + 1) * 10 * 60_000));
      await r.notes.update(id, { subjectId: null, chapterId: null, title: 'T', body: `w${i}`, tags: [] });
    }
    const revisions = await r.notes.revisions(id);
    expect(revisions).toHaveLength(20);
    await r.notes.restoreRevision(revisions.at(-1)!.id);
    const restored = await r.notes.get(id);
    expect(restored?.body).toBe(revisions.at(-1)!.body);
  });
});

describe('flashcards and spaced repetition persistence', () => {
  it('reviews cards, records history and schedules the next review', async () => {
    const r = await setup();
    const id = await r.flashcards.create({ subjectId: null, chapterId: null, front: 'Capital of Peru?', back: 'Lima', tags: ['geo'], difficulty: 'easy' });
    expect(await r.flashcards.dueCount()).toBe(1);
    const after = await r.flashcards.review(id, 'medium');
    expect(after).toMatchObject({ repetitions: 1, intervalDays: 1, dueDay: addDays(TODAY, 1) });
    expect(await r.flashcards.dueCount()).toBe(0);
    await r.flashcards.review(id, 'again');
    const history = await r.flashcards.history(id);
    expect(history.map((h) => h.grade)).toEqual(['again', 'medium']);
    expect((await r.flashcards.get(id))?.lapses).toBe(1);
    await r.flashcards.resetProgress(id);
    expect(await r.flashcards.get(id)).toMatchObject({ repetitions: 0, lastReviewedAt: null, dueDay: TODAY });
  });

  it('selects due cards from history and respects the daily new-card limit', async () => {
    const r = await setup();
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) ids.push(await r.flashcards.create({ subjectId: null, chapterId: null, front: `Q${i}`, back: 'A', tags: [], difficulty: 'medium' }));
    expect(await r.flashcards.dueCards({}, { newCards: 3, reviews: 100 })).toHaveLength(3);
    await r.flashcards.review(ids[0]!, 'easy');
    await r.flashcards.review(ids[1]!, 'easy');
    // Two new cards introduced today: one left.
    expect(await r.flashcards.dueCards({}, { newCards: 3, reviews: 100 })).toHaveLength(1);
    clock.set(() => new Date(2026, 10, 16, 9));
    const due = await r.flashcards.dueCards({}, { newCards: 3, reviews: 100 });
    expect(due.slice(0, 2).map((c) => c.id).sort()).toEqual([ids[0], ids[1]].sort());
    expect(await r.flashcards.maturity()).toEqual({ new: 3, learning: 2, young: 0, mature: 0 });
  });

  it('searches and filters cards', async () => {
    const r = await setup();
    await r.flashcards.create({ subjectId: null, chapterId: null, front: 'Mitosis', back: 'Cell division', tags: ['bio'], difficulty: 'hard' });
    await r.flashcards.create({ subjectId: null, chapterId: null, front: 'Lima', back: 'Peru', tags: [], difficulty: 'easy' });
    expect(await r.flashcards.list({ query: 'division' })).toHaveLength(1);
    expect(await r.flashcards.list({ difficulty: 'easy' })).toHaveLength(1);
    expect(await r.flashcards.count()).toBe(2);
  });
});

describe('planner, study log and focus', () => {
  it('creates recurring sessions, completes them once and logs minutes idempotently', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    const { count, seriesId } = await r.planner.createRecurring({ subjectId: sid, title: 'Bio', goal: '', startMinute: 18 * 60, durationMin: 45 }, { frequency: 'weekly', weekdays: [1, 3, 5], interval: 1, startDay: '2026-11-13', untilDay: '2026-11-27' });
    expect(count).toBe(7);
    expect(await r.planner.seriesRule(seriesId)).toMatchObject({ weekdays: [1, 3, 5] });
    const [first] = await r.planner.sessionsBetween(TODAY, TODAY);
    await r.planner.completeSession(first!.id, 50);
    await r.planner.completeSession(first!.id, 50);
    const log = await r.planner.logSince(TODAY);
    expect(log).toEqual([{ day: TODAY, minutes: 50, subjectId: sid, source: 'session' }]);
    await r.planner.reopenSession(first!.id);
    expect(await r.planner.logSince(TODAY)).toEqual([]);
  });

  it('reschedules, skips and deletes upcoming occurrences of a series only', async () => {
    const r = await setup();
    await r.planner.createRecurring({ subjectId: null, title: 'Read', goal: '', startMinute: 600, durationMin: 30 }, { frequency: 'daily', weekdays: [], interval: 1, startDay: '2026-11-10', untilDay: '2026-11-16' });
    const all = await r.planner.sessionsBetween('2026-11-01', '2026-11-30');
    await r.planner.completeSession(all[0]!.id);
    await r.planner.skipSession(all[1]!.id);
    await r.planner.reschedule(all[2]!.id, '2026-11-20', 540);
    expect(await r.planner.getSession(all[2]!.id)).toMatchObject({ day: '2026-11-20', rescheduledFrom: '2026-11-12', startMinute: 540 });
    await r.planner.removeSession(all[4]!.id, true);
    const left = await r.planner.sessionsBetween('2026-11-01', '2026-11-30');
    // Past done/skipped occurrences stay; planned ones from Nov 14 on are gone (the moved one too).
    expect(left.map((s) => s.day)).toEqual(['2026-11-10', '2026-11-11', '2026-11-13']);
    expect((await r.planner.history()).length).toBeGreaterThan(0);
  });

  it('saves focus sessions into the study log and totals them by subject', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    await r.planner.saveFocus({ subjectId: sid, preset: '25_5', startedAt: NOW.toISOString(), endedAt: NOW.toISOString(), focusMinutes: 50, cycles: 2, completed: true });
    await r.planner.saveFocus({ subjectId: null, preset: 'custom', startedAt: NOW.toISOString(), endedAt: NOW.toISOString(), focusMinutes: 10, cycles: 0, completed: false });
    expect(await r.planner.focusTotals()).toEqual({ sessions: 2, minutes: 60, bySubject: [{ subjectId: sid, minutes: 50 }, { subjectId: null, minutes: 10 }] });
    expect((await r.planner.logSince(TODAY)).reduce((s, l) => s + l.minutes, 0)).toBe(60);
    expect(await r.planner.lastStudyDayBySubject()).toEqual({ [sid]: TODAY });
  });
});

describe('exams, deadlines and checklists', () => {
  it('stores exams and deadlines with checklists and completion', async () => {
    const r = await setup();
    const exam = await r.agenda.create({ kind: 'exam', title: 'Final', subjectId: null, day: '2026-12-10', minute: 9 * 60, priority: 'high', notes: 'Room 4' });
    const dl = await r.agenda.create({ kind: 'project', title: 'Poster', subjectId: null, day: '2026-11-20', minute: null, priority: 'medium', notes: '' });
    expect(exam.table).toBe('exams');
    expect(dl.table).toBe('deadlines');
    const step = await r.agenda.addChecklistItem('exams', exam.id, 'Past papers');
    await r.agenda.addChecklistItem('exams', exam.id, 'Mock exam');
    await r.agenda.toggleChecklistItem(step, true);
    expect(await r.agenda.get('exams', exam.id)).toMatchObject({ checklistDone: 1, checklistTotal: 2, notes: 'Room 4' });
    await r.agenda.setDeadlineDone(dl.id, true);
    expect((await r.agenda.get('deadlines', dl.id))?.done).toBe(true);
    expect(await r.agenda.list({ from: '2026-12-01' })).toHaveLength(1);
    await r.agenda.remove('exams', exam.id);
    expect(await r.db.getAllAsync('SELECT * FROM checklist_items', [])).toHaveLength(0);
  });
});

describe('goals, activity and achievements', () => {
  it('aggregates activity from every source and computes achievement stats', async () => {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    const cid = await r.subjects.createCourse(sid, 'C');
    await r.subjects.setChapterDone(await r.subjects.createChapter(cid, 'Ch'), true);
    await r.planner.logManual(sid, 40);
    const card = await r.flashcards.create({ subjectId: sid, chapterId: null, front: 'f', back: 'b', tags: [], difficulty: 'medium' });
    await r.flashcards.review(card, 'easy');
    await r.quiz.saveAttempt({ bankId: 'logic', subjectId: null, mode: 'exam', startedAt: NOW.toISOString(), finishedAt: NOW.toISOString(), day: TODAY, durationMs: 1, timeLimitS: 60, total: 5, correct: 5, score: 100, answers: [] });
    const activity = await r.goals.activity(TODAY);
    const mine = activity.find((a) => a.subjectId === sid);
    expect(mine).toMatchObject({ minutes: 40, chapters: 1, flashcards: 1 });
    expect(activity.find((a) => a.subjectId === null)?.quizzes).toBe(1);
    expect(await r.goals.activeDays()).toEqual([TODAY]);
    const stats = await r.goals.achievementStats();
    expect(stats).toMatchObject({ subjectsCreated: 1, cardsCreated: 1, cardsReviewed: 1, quizzesCompleted: 1, perfectQuizzes: 1, chaptersCompleted: 1, totalMinutes: 40, streak: 1 });
    await r.goals.unlock(['first_subject', 'first_subject']);
    expect(await r.goals.unlockedAchievements()).toHaveLength(1);
  });

  it('creates, updates, pauses and deletes goals', async () => {
    const r = await setup();
    const id = await r.goals.create({ title: '', period: 'weekly', metric: 'minutes', target: 0, subjectId: null, startDay: null, endDay: null });
    expect((await r.goals.list())[0]?.target).toBe(1);
    await r.goals.setActive(id, false);
    expect(await r.goals.list(true)).toHaveLength(0);
    expect(await r.goals.list(false)).toHaveLength(1);
    await r.goals.remove(id);
    expect(await r.goals.list(false)).toHaveLength(0);
  });
});

describe('templates', () => {
  it('applies a template atomically: subject, structure, sessions, goals and exam', async () => {
    const r = await setup();
    const tpl = TEMPLATES.find((t) => t.id === 'exam-prep-4-weeks')!;
    const c = defaultCustomization(tpl, 'Chemistry finals', TODAY);
    const sid = await applyTemplate(r, tpl, c, (spec) => `${spec.key}${spec.n ?? ''}`);
    const s = await r.subjects.get(sid);
    expect(s).toMatchObject({ name: 'Chemistry finals', courses: tpl.courses.length, chapters: tpl.courses.reduce((n, x) => n + x.chapters.length, 0), targetDay: addDays(TODAY, 27) });
    expect((await r.planner.sessionsBetween(TODAY, addDays(TODAY, 40))).length).toBeGreaterThan(10);
    expect(await r.goals.list()).toHaveLength(tpl.goals.length);
    const [exam] = await r.agenda.list();
    expect(exam).toMatchObject({ kind: 'exam', day: addDays(TODAY, 27), checklistTotal: tpl.exam!.checklist.length });
  });

  it('rolls back everything if applying fails half-way', async () => {
    const r = await setup();
    const tpl = TEMPLATES[0]!;
    let calls = 0;
    await expect(
      applyTemplate(r, tpl, defaultCustomization(tpl, 'X', TODAY), () => {
        if (++calls > 3) throw new Error('label failure');
        return 'label';
      }),
    ).rejects.toThrow('label failure');
    expect(await r.subjects.list('all')).toHaveLength(0);
    expect(await r.db.getAllAsync('SELECT * FROM courses', [])).toHaveLength(0);
  });

  it('saves user templates next to bundled ones', async () => {
    const r = await setup();
    const { id: _id, premium: _p, ...def } = TEMPLATES[0]!;
    const id = await r.templates.saveUserTemplate('My plan', def);
    expect((await r.templates.get(id))).toMatchObject({ source: 'user', name: 'My plan' });
    await seedContentIfNeeded(r.db, true);
    expect(await r.templates.get(id)).not.toBeNull();
    await r.templates.removeUserTemplate(id);
    expect(await r.templates.get(id)).toBeNull();
  });
});

describe('backup, restore and deletion', () => {
  async function populated() {
    const r = await setup();
    const sid = await r.subjects.create(subject);
    const cid = await r.subjects.createCourse(sid, 'C');
    await r.subjects.createChapter(cid, 'Ch');
    await r.notes.create({ subjectId: sid, chapterId: null, title: 'Secret note', body: 'body', tags: ['t'] });
    const card = await r.flashcards.create({ subjectId: sid, chapterId: null, front: 'f', back: 'b', tags: [], difficulty: 'medium' });
    await r.flashcards.review(card, 'medium');
    await r.quiz.saveUserQuestion(sid, { id: 'draft', type: 'true_false', difficulty: 1, prompt: 'Is it?', explanation: 'Yes', correct: true });
    await r.settings.setNotificationSetting('exam', { enabled: true, hour: 8, minute: 0, leadMinutes: 0 });
    return r;
  }

  it('exports user rows only and restores them into a fresh database', async () => {
    const r = await populated();
    const { json, fileName, backup } = await exportUserData(r.db, NOW);
    expect(fileName).toBe('learnsphere-backup-2026-11-13.json');
    expect(backup.tables.quiz_questions).toHaveLength(1);
    expect(backup.tables.templates).toHaveLength(0);

    const target = await setup();
    const { restoredRows } = await importUserData(target.db, json);
    expect(restoredRows).toBeGreaterThan(5);
    expect((await target.notes.list()).map((n) => n.title)).toEqual(['Secret note']);
    expect(await target.flashcards.history((await target.flashcards.list())[0]!.id)).toHaveLength(1);
    expect(await target.quiz.countUserQuestions()).toBe(1);
    expect((await target.quiz.bankCounts()).general).toBe(QUIZ_BANKS[0]!.questions.length);
    expect((await target.templates.list()).length).toBe(TEMPLATES.length);
    expect((await target.settings.notificationSettings()).exam.enabled).toBe(true);
  });

  it('rejects invalid or foreign backups without touching data', async () => {
    const r = await populated();
    await expect(importUserData(r.db, 'not json')).rejects.toMatchObject({ code: 'invalid_json' });
    await expect(importUserData(r.db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'devspeak', schemaVersion: 1, tables: {} }))).rejects.toMatchObject({ code: 'wrong_app' });
    await expect(importUserData(r.db, JSON.stringify({ format: 'factory-backup', formatVersion: 1, appId: 'learnsphere', schemaVersion: 999, tables: {} }))).rejects.toMatchObject({ code: 'newer_schema' });
    expect(await r.notes.count()).toBe(1);
  });

  it('deletes all personal data but keeps bundled content', async () => {
    const r = await populated();
    await deleteAllUserData(r.db);
    expect(await r.subjects.list('all')).toHaveLength(0);
    expect(await r.notes.count()).toBe(0);
    expect(await r.flashcards.count()).toBe(0);
    expect(await r.quiz.countUserQuestions()).toBe(0);
    expect(await r.db.getAllAsync('SELECT * FROM flashcard_reviews', [])).toHaveLength(0);
    expect((await r.quiz.bankCounts()).science).toBe(QUIZ_BANKS[3]!.questions.length);
    expect((await r.settings.notificationSettings()).exam.enabled).toBe(false);
  });
});

describe('offline-first', () => {
  it('app code never calls the network directly', () => {
    const files: string[] = [];
    const walk = (dir: string) =>
      fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== '__tests__') walk(p);
        else if (/\.tsx?$/.test(e.name)) files.push(p);
      });
    walk(path.join(__dirname, '..'));
    walk(path.join(__dirname, '..', '..', 'app'));
    const offenders = files.filter((f) => /\bfetch\(|XMLHttpRequest|axios/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('initialises the database and works with the network unavailable', async () => {
    const original = global.fetch;
    global.fetch = jest.fn(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    try {
      const r = await setup();
      await r.subjects.create(subject);
      expect(await r.subjects.countActive()).toBe(1);
      expect(global.fetch).not.toHaveBeenCalled();
    } finally {
      global.fetch = original;
    }
  });
});
