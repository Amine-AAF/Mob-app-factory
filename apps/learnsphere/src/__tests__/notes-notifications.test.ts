import { applyFormat, noteToMarkdown, parseInline, parseNote, plainText, preview } from '@/features/notes/format';
import { buildNotificationPlan, DEFAULT_NOTIFICATION_SETTINGS, MAX_DATED, type NotificationSettings } from '@/features/notifications/plan';
import { likePattern, normalizeText, parseTags } from '@/utils/text';

describe('note formatting', () => {
  const body = '# Cell biology\n## Organelles\n- **Nucleus** holds DNA\n- ==Mitochondria== make ATP\n\n1. First\n2. Second\n> Key idea\nPlain text';

  it('parses headings, lists, quotes, highlights and bold', () => {
    const blocks = parseNote(body);
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'subheading', 'bullet', 'bullet', 'spacer', 'numbered', 'numbered', 'quote', 'paragraph']);
    expect(parseInline('a ==b== c **d**')).toEqual([{ text: 'a ' }, { text: 'b', highlight: true }, { text: ' c ' }, { text: 'd', bold: true }]);
    const numbered = blocks.filter((b) => b.type === 'numbered') as { index: number }[];
    expect(numbered.map((b) => b.index)).toEqual([1, 2]);
  });

  it('extracts plain text for search and previews', () => {
    expect(plainText(body)).not.toMatch(/[#=*>]/);
    expect(preview('x'.repeat(300), 50)).toHaveLength(50);
  });

  it('applies toolbar formatting to the current line or selection', () => {
    expect(applyFormat('hello', { start: 2, end: 2 }, 'heading').body).toBe('# hello');
    expect(applyFormat('# hello', { start: 3, end: 3 }, 'heading').body).toBe('hello');
    expect(applyFormat('# hello', { start: 3, end: 3 }, 'bullet').body).toBe('- hello');
    expect(applyFormat('a\nline two', { start: 4, end: 4 }, 'numbered').body).toBe('a\n1. line two');
    expect(applyFormat('make this bold', { start: 5, end: 9 }, 'bold').body).toBe('make **this** bold');
    expect(applyFormat('word', { start: 0, end: 4 }, 'highlight').body).toBe('==word==');
  });

  it('exports Markdown with tags', () => {
    expect(noteToMarkdown({ title: 'T', body: 'Body', tags: ['exam', 'ch1'] })).toBe('# T\n\nBody\n\n#exam #ch1\n');
  });
});

describe('text helpers', () => {
  it('normalises, parses tags and escapes LIKE patterns', () => {
    expect(normalizeText('  Équation   Différentielle ')).toBe('equation differentielle');
    expect(parseTags('Maths, #exam, maths\n')).toEqual(['maths', 'exam']);
    expect(likePattern('50%_off')).toBe('%50\\%\\_off%');
  });
});

describe('local notification plan', () => {
  const now = new Date(2026, 10, 13, 12, 0);
  const on = (over: Partial<NotificationSettings>): NotificationSettings => ({ ...DEFAULT_NOTIFICATION_SETTINGS, ...over });
  const input = {
    now,
    sessions: [
      { id: 's1', title: 'Math', day: '2026-11-13', startMinute: 18 * 60, status: 'planned' },
      { id: 's2', title: 'Old', day: '2026-11-13', startMinute: 8 * 60, status: 'planned' },
      { id: 's3', title: 'Done', day: '2026-11-14', startMinute: 18 * 60, status: 'done' },
      { id: 's4', title: 'Far', day: '2026-12-30', startMinute: 18 * 60, status: 'planned' },
    ],
    exams: [{ id: 'e1', title: 'Physics', day: '2026-11-20' }],
    deadlines: [
      { id: 'd1', title: 'Essay', day: '2026-11-14', done: false },
      { id: 'd2', title: 'Report', day: '2026-11-15', done: true },
    ],
  };

  it('schedules nothing when every reminder is disabled (the default)', () => {
    expect(buildNotificationPlan({ ...input, settings: DEFAULT_NOTIFICATION_SETTINGS })).toEqual([]);
  });

  it('schedules future session reminders with the lead time only', () => {
    const plan = buildNotificationPlan({ ...input, settings: on({ session: { enabled: true, hour: 0, minute: 0, leadMinutes: 15 } }) });
    expect(plan.map((p) => p.id)).toEqual(['ls-session-s1']);
    expect((plan[0]?.trigger as { at: number }).at).toBe(new Date(2026, 10, 13, 17, 45).getTime());
  });

  it('schedules exam (7, 1, 0 days) and deadline (2, 0 days) reminders in the future only', () => {
    const plan = buildNotificationPlan({ ...input, settings: on({ exam: { enabled: true, hour: 9, minute: 0, leadMinutes: 0 }, deadline: { enabled: true, hour: 9, minute: 0, leadMinutes: 0 } }) });
    const ids = plan.map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(['ls-exam-e1-1', 'ls-exam-e1-0', 'ls-deadline-d1-0']));
    // 7 days before Nov 20 is Nov 13 09:00: already past at noon. Two days before Nov 14 is past too.
    expect(ids).not.toContain('ls-exam-e1-7');
    expect(ids).not.toContain('ls-deadline-d1-2');
    expect(ids.some((id) => id.includes('d2'))).toBe(false);
    expect(plan.find((p) => p.id === 'ls-deadline-d1-0')?.titleKey).toBe('notifications.deadlineTodayTitle');
  });

  it('uses repeating triggers for daily goal, flashcards and weekly review', () => {
    const plan = buildNotificationPlan({ ...input, settings: on({ daily_goal: { enabled: true, hour: 19, minute: 30, leadMinutes: 0 }, flashcards: { enabled: true, hour: 20, minute: 0, leadMinutes: 0 }, review: { enabled: true, hour: 18, minute: 0, leadMinutes: 0 } }) });
    expect(plan.map((p) => p.trigger.type)).toEqual(['daily', 'daily', 'weekly']);
    expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
  });

  it('caps dated notifications to avoid flooding the learner', () => {
    const sessions = Array.from({ length: 200 }, (_, i) => ({ id: `x${i}`, title: 'S', day: '2026-11-14', startMinute: 6 * 60 + i, status: 'planned' }));
    const plan = buildNotificationPlan({ ...input, sessions, settings: on({ session: { enabled: true, hour: 0, minute: 0, leadMinutes: 0 } }) });
    expect(plan).toHaveLength(MAX_DATED);
  });
});
