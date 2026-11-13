import { basePluralKey, flattenKeys } from '@factory/localization';
import fs from 'node:fs';
import path from 'node:path';

import { EVENT_TYPES } from '@/content/eventTypes';
import { INVITATION_TEMPLATES } from '@/content/invitationTemplates';
import { EVENT_TEMPLATES, TASK_LIBRARY, TIMELINE_LIBRARY } from '@/content/templates';
import { BRAND_CHOICES } from '@/config/brand';
import {
  BUDGET_CATEGORIES,
  EVENT_STATUSES,
  EVENT_THEMES,
  GROUP_KINDS,
  GUEST_CATEGORIES,
  NOTIFICATION_KINDS,
  PAYMENT_STATUSES,
  RSVP_SOURCES,
  RSVP_STATUSES,
  TABLE_SHAPES,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  VENDOR_CATEGORIES,
  VENDOR_STATUSES,
} from '@/domain/types';
import { initI18n, resources } from '@/i18n';

type Dict = Record<string, unknown>;
const get = (obj: Dict, key: string): unknown => key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Dict)[k] : undefined), obj);
const has = (obj: Dict, key: string) => typeof get(obj, key) === 'string' || typeof get(obj, `${key}_other`) === 'string';
const baseKeys = (obj: Dict) => new Set(flattenKeys(obj).map(basePluralKey));
const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();

const ROOT = path.resolve(__dirname, '..', '..');
function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === '__tests__' || e.name === 'node_modules' ? [] : sourceFiles(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

describe('translations', () => {
  const en = resources.en as Dict;

  it('has the same keys in English, French and Spanish', () => {
    const ref = baseKeys(en);
    for (const lng of ['fr', 'es'] as const) {
      const other = baseKeys(resources[lng] as Dict);
      expect([...ref].filter((k) => !other.has(k))).toEqual([]);
      expect([...other].filter((k) => !ref.has(k))).toEqual([]);
    }
  });

  it('has no empty strings and keeps placeholders consistent', () => {
    for (const key of flattenKeys(en)) {
      const source = get(en, key) as string;
      expect(source.trim()).not.toBe('');
      for (const lng of ['fr', 'es'] as const) {
        const value = get(resources[lng] as Dict, key) ?? get(resources[lng] as Dict, `${basePluralKey(key)}_other`);
        expect(typeof value).toBe('string');
        expect({ key, lng, p: placeholders(value as string) }).toEqual({ key, lng, p: placeholders(source) });
      }
    }
  });

  it('defines every key used literally in the code', () => {
    const missing: string[] = [];
    for (const file of [...sourceFiles(path.join(ROOT, 'app')), ...sourceFiles(path.join(ROOT, 'src'))]) {
      const text = fs.readFileSync(file, 'utf8');
      for (const m of text.matchAll(/\b(?:t|tr)\(\s*'([a-zA-Z0-9_.]+)'/g)) {
        const key = m[1]!;
        if (!has(en, key)) missing.push(`${path.relative(ROOT, file)}: ${key}`);
      }
      for (const m of text.matchAll(/'(notifications\.[a-zA-Z.]+)'/g)) if (!has(en, m[1]!)) missing.push(`${path.relative(ROOT, file)}: ${m[1]}`);
    }
    expect(missing).toEqual([]);
  });

  it('covers every dynamic key family', () => {
    const families: [string, readonly string[], string?][] = [
      ['eventTypes', EVENT_TYPES.map((x) => x.id)],
      ['eventStatus', EVENT_STATUSES],
      ['themes', EVENT_THEMES],
      ['rsvp', RSVP_STATUSES],
      ['rsvpSource', RSVP_SOURCES],
      ['guestCategory', GUEST_CATEGORIES],
      ['groupKind', GROUP_KINDS],
      ['budgetCategory', BUDGET_CATEGORIES],
      ['payment', PAYMENT_STATUSES],
      ['taskStatus', TASK_STATUSES],
      ['priority', TASK_PRIORITIES],
      ['taskCategory', TASK_CATEGORIES],
      ['vendorCategory', VENDOR_CATEGORIES],
      ['vendorStatus', VENDOR_STATUSES],
      ['tableShape', TABLE_SHAPES],
      ['taskLibrary', Object.keys(TASK_LIBRARY)],
      ['timelineLibrary', TIMELINE_LIBRARY],
      ['invitationTemplates', INVITATION_TEMPLATES.map((x) => x.id)],
      ['templates.items', EVENT_TEMPLATES.map((x) => x.id), 'name'],
      ['templates.items', EVENT_TEMPLATES.map((x) => x.id), 'desc'],
      ['notificationsSettings.kinds', NOTIFICATION_KINDS, 'title'],
      ['settings.palette', BRAND_CHOICES.map((x) => x.id)],
      ['reports.kinds', ['guests', 'rsvp', 'budget', 'expenses', 'timeline', 'vendors', 'seating', 'gifts', 'tasks', 'final']],
      ['reports.desc', ['guests', 'rsvp', 'budget', 'expenses', 'timeline', 'vendors', 'seating', 'gifts', 'tasks', 'final']],
      ['premium.limitReached', ['unlimitedEvents', 'moreGuests', 'premiumInvitations', 'advancedSeating', 'pdfExport', 'csvExport', 'advancedBudget', 'vendors', 'premiumTemplates', 'customTemplates', 'advancedReports', 'noAds']],
      ['premium.features', ['unlimitedEvents', 'moreGuests', 'premiumInvitations', 'advancedSeating', 'pdfExport', 'csvExport', 'advancedBudget', 'vendors', 'premiumTemplates', 'customTemplates', 'advancedReports', 'noAds'], 'title'],
      ['import.issue', ['missingName', 'invalidEmail', 'invalidCount', 'unknownRsvp', 'tooLong']],
      ['data.errors', ['invalid_json', 'invalid_format', 'wrong_app', 'newer_schema']],
      ['errors.event', ['name', 'nameTooLong', 'startDate', 'startTime', 'endDate', 'endTime', 'timezone', 'endBeforeStart', 'expectedGuests', 'budget', 'currency']],
      ['paywall.plans', ['monthly', 'annual', 'lifetime', 'unknown']],
      ['tasks.bucket', ['overdue', 'today', 'week', 'later', 'undated', 'done']],
    ];
    const missing: string[] = [];
    for (const [prefix, ids, suffix] of families) for (const id of ids) {
      const key = `${prefix}.${id}${suffix ? `.${suffix}` : ''}`;
      if (!has(en, key)) missing.push(key);
    }
    for (const kind of ['taskDue', 'deadlineSoon', 'eventUpcoming', 'rsvpFollowup', 'paymentDue', 'vendorMeeting']) {
      for (const k of ['title', 'titleNamed', 'body']) if (!has(en, `notifications.${kind}.${k}`)) missing.push(`notifications.${kind}.${k}`);
    }
    expect(missing).toEqual([]);
  });

  it('pluralises and interpolates at runtime', async () => {
    const i18n = await initI18n('fr', []);
    expect(i18n.t('event.inDays', { count: 1 })).toBe('Dans 1 jour');
    expect(i18n.t('event.inDays', { count: 3 })).toBe('Dans 3 jours');
    await i18n.changeLanguage('es');
    expect(i18n.t('timeline.overlapsFound', { count: 2 })).toBe('2 solapamientos en el programa');
    await i18n.changeLanguage('en');
    expect(i18n.t('guests.duplicates.found', { count: 1 })).toBe('1 possible duplicate');
  });

  it('falls back to English for unsupported device languages', async () => {
    const i18n = await initI18n(null, ['de', 'it']);
    expect(i18n.language).toBe('en');
    const fr = await initI18n(null, ['fr-CA']);
    expect(fr.language).toBe('fr');
  });
});
