import type { IconName } from '@factory/design-system';

import type { TableName } from '@/database/repositories';
import { diffDays, isValidDayKey, isValidTime, splitInstant, toInstant } from '@/domain/dates';
import { defaultReminderTimes } from '@/domain/health';
import {
  ACTIVITY_TYPES,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  EXPENSE_CATEGORIES,
  FOOD_TYPES,
  STOCK_UNITS,
  TREATMENT_FREQUENCIES,
  type DayKey,
} from '@/domain/types';
import { fromKg, parseDecimal, toKg, type WeightUnit } from '@/domain/units';

/**
 * Declarative forms. Each record kind lists its fields once; the generic
 * `app/record/[kind].tsx` screen renders, validates and saves them.
 * Medical fields are free text typed by the user: the app never pre-fills a
 * diagnosis, a dosage or a vaccination schedule.
 */
export type FieldType = 'text' | 'multiline' | 'decimal' | 'integer' | 'money' | 'weight' | 'date' | 'time' | 'datetime' | 'select' | 'intSelect' | 'toggle' | 'times' | 'pet';

export interface FieldSpec {
  name: string;
  type: FieldType;
  /** i18n key */
  label: string;
  required?: boolean;
  options?: readonly string[];
  /** i18n prefix for option labels: `${optionPrefix}.${option}` */
  optionPrefix?: string;
  help?: string;
  placeholder?: string;
  showIf?: (v: FormValues) => boolean;
  /** Pet selector may be empty (e.g. household expense). */
  optional?: boolean;
}

export type FormValues = Record<string, unknown>;

export interface FormContext {
  petId: string | null;
  today: DayKey;
  nowTime: string;
  weightUnit: WeightUnit;
  currency: string;
}

export const RECORD_KINDS = ['health', 'vaccination', 'treatment', 'weight', 'feeding', 'food', 'appointment', 'activity', 'expense'] as const;
export type RecordKind = (typeof RECORD_KINDS)[number];

export interface RecordSpec {
  kind: RecordKind;
  table: TableName;
  icon: IconName;
  /** i18n keys */
  title: string;
  newTitle: string;
  fields: FieldSpec[];
  defaults: (ctx: FormContext) => FormValues;
  /** Returns i18n error keys by field name. */
  validate?: (v: FormValues) => Record<string, string>;
  /** Called when a field changes; may return extra field updates. */
  onChange?: (name: string, value: unknown, v: FormValues) => FormValues | null;
  /** Entity fields that are not form fields but must be set on create. */
  fixed?: (ctx: FormContext) => Record<string, unknown>;
  /** The record date used for the free history window. */
  dayOf: (entity: Record<string, unknown>) => DayKey;
}

const pet: FieldSpec = { name: 'petId', type: 'pet', label: 'fields.pet', required: true };
const notes: FieldSpec = { name: 'notes', type: 'multiline', label: 'fields.notes' };

const requireText = (v: FormValues, name: string) => (String(v[name] ?? '').trim() ? null : 'errors.required');

function collect(...pairs: [string, string | null][]): Record<string, string> {
  return Object.fromEntries(pairs.filter((p): p is [string, string] => p[1] !== null));
}

const instantDay = (iso: unknown) => (typeof iso === 'string' ? splitInstant(iso).day : '');

export const SPECS: Record<RecordKind, RecordSpec> = {
  health: {
    kind: 'health',
    table: 'health',
    icon: 'medkit-outline',
    title: 'records.health.title',
    newTitle: 'records.health.new',
    fields: [
      pet,
      { name: 'date', type: 'date', label: 'fields.visitDate', required: true },
      { name: 'reason', type: 'text', label: 'fields.reason', required: true, placeholder: 'records.health.reasonPlaceholder' },
      { name: 'vetName', type: 'text', label: 'fields.vet' },
      { name: 'clinic', type: 'text', label: 'fields.clinic' },
      { name: 'diagnosis', type: 'multiline', label: 'fields.diagnosis', help: 'records.health.diagnosisHelp' },
      { name: 'exams', type: 'multiline', label: 'fields.exams' },
      { name: 'results', type: 'multiline', label: 'fields.results', help: 'records.health.resultsHelp' },
      { name: 'cost', type: 'money', label: 'fields.consultationCost' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, date: c.today, currency: c.currency }),
    validate: (v) => collect(['reason', requireText(v, 'reason')], ['date', isValidDayKey(v.date as string) ? null : 'errors.required']),
    dayOf: (e) => e.date as DayKey,
  },
  vaccination: {
    kind: 'vaccination',
    table: 'vaccinations',
    icon: 'shield-checkmark-outline',
    title: 'records.vaccination.title',
    newTitle: 'records.vaccination.new',
    fields: [
      pet,
      { name: 'name', type: 'text', label: 'fields.vaccineName', required: true },
      { name: 'administeredDate', type: 'date', label: 'fields.administeredDate' },
      { name: 'nextDueDate', type: 'date', label: 'fields.nextDueDate', help: 'records.vaccination.nextDueHelp' },
      { name: 'reminderDaysBefore', type: 'intSelect', label: 'fields.remindBefore', options: ['0', '1', '3', '7', '14', '30'], optionPrefix: 'options.daysBefore', showIf: (v) => !!v.nextDueDate },
      { name: 'vetName', type: 'text', label: 'fields.vet' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, administeredDate: c.today, reminderDaysBefore: '7' }),
    validate: (v) =>
      collect(
        ['name', requireText(v, 'name')],
        [
          'nextDueDate',
          v.nextDueDate && v.administeredDate && diffDays(v.administeredDate as string, v.nextDueDate as string) < 0 ? 'errors.dueBeforeAdministered' : !v.administeredDate && !v.nextDueDate ? 'errors.vaccineDate' : null,
        ],
      ),
    dayOf: (e) => (e.administeredDate ?? e.nextDueDate ?? e.createdAt) as DayKey,
  },
  treatment: {
    kind: 'treatment',
    table: 'treatments',
    icon: 'bandage-outline',
    title: 'records.treatment.title',
    newTitle: 'records.treatment.new',
    fields: [
      pet,
      { name: 'name', type: 'text', label: 'fields.treatmentName', required: true },
      { name: 'instructions', type: 'multiline', label: 'fields.instructions', help: 'records.treatment.instructionsHelp' },
      { name: 'startDate', type: 'date', label: 'fields.startDate', required: true },
      { name: 'endDate', type: 'date', label: 'fields.endDate' },
      { name: 'frequency', type: 'select', label: 'fields.frequency', options: TREATMENT_FREQUENCIES, optionPrefix: 'options.frequency', required: true, help: 'records.treatment.frequencyHelp' },
      { name: 'remindersEnabled', type: 'toggle', label: 'fields.doseReminders', showIf: (v) => v.frequency !== 'as_needed' },
      { name: 'reminderTimes', type: 'times', label: 'fields.reminderTimes', showIf: (v) => v.frequency !== 'as_needed' && v.remindersEnabled === true },
      { name: 'prescriber', type: 'text', label: 'fields.prescriber' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, startDate: c.today, frequency: 'once_daily', remindersEnabled: true, reminderTimes: ['09:00'] }),
    fixed: () => ({ stoppedAt: null }),
    onChange: (name, value) => (name === 'frequency' ? { reminderTimes: defaultReminderTimes(value as never) } : null),
    validate: (v) =>
      collect(
        ['name', requireText(v, 'name')],
        ['startDate', isValidDayKey(v.startDate as string) ? null : 'errors.required'],
        ['endDate', v.endDate && v.startDate && diffDays(v.startDate as string, v.endDate as string) < 0 ? 'errors.endBeforeStart' : null],
        ['reminderTimes', v.remindersEnabled && v.frequency !== 'as_needed' && (v.reminderTimes as string[]).length === 0 ? 'errors.addTime' : null],
      ),
    dayOf: (e) => e.startDate as DayKey,
  },
  weight: {
    kind: 'weight',
    table: 'weights',
    icon: 'scale-outline',
    title: 'records.weight.title',
    newTitle: 'records.weight.new',
    fields: [
      pet,
      { name: 'date', type: 'date', label: 'fields.measureDate', required: true },
      { name: 'weightKg', type: 'weight', label: 'fields.weight', required: true },
      { name: 'heightCm', type: 'decimal', label: 'fields.heightCm' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, date: c.today }),
    validate: (v) => collect(['weightKg', (parseDecimal(v.weightKg as string) ?? 0) > 0 ? null : 'errors.positiveNumber'], ['date', isValidDayKey(v.date as string) ? null : 'errors.required']),
    dayOf: (e) => e.date as DayKey,
  },
  feeding: {
    kind: 'feeding',
    table: 'feeding',
    icon: 'restaurant-outline',
    title: 'records.feeding.title',
    newTitle: 'records.feeding.new',
    fields: [
      pet,
      { name: 'foodType', type: 'select', label: 'fields.foodType', options: FOOD_TYPES, optionPrefix: 'options.foodType', required: true },
      { name: 'brand', type: 'text', label: 'fields.brand' },
      { name: 'product', type: 'text', label: 'fields.product' },
      { name: 'quantity', type: 'text', label: 'fields.quantityPerMeal', placeholder: 'records.feeding.quantityPlaceholder', help: 'records.feeding.quantityHelp' },
      { name: 'mealTimes', type: 'times', label: 'fields.mealTimes' },
      { name: 'remindersEnabled', type: 'toggle', label: 'fields.mealReminders' },
      { name: 'active', type: 'toggle', label: 'fields.activeSchedule' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, foodType: 'dry', mealTimes: ['08:00', '18:00'], remindersEnabled: false, active: true }),
    validate: (v) => collect(['mealTimes', v.remindersEnabled && (v.mealTimes as string[]).length === 0 ? 'errors.addTime' : null]),
    dayOf: (e) => String(e.createdAt).slice(0, 10),
  },
  food: {
    kind: 'food',
    table: 'food',
    icon: 'cube-outline',
    title: 'records.food.title',
    newTitle: 'records.food.new',
    fields: [
      { ...pet, required: false, optional: true, label: 'fields.petOptional' },
      { name: 'name', type: 'text', label: 'fields.productName', required: true },
      { name: 'brand', type: 'text', label: 'fields.brand' },
      { name: 'unit', type: 'select', label: 'fields.unit', options: STOCK_UNITS, optionPrefix: 'options.unit', required: true },
      { name: 'quantity', type: 'decimal', label: 'fields.stockQuantity', required: true },
      { name: 'lowThreshold', type: 'decimal', label: 'fields.lowThreshold', help: 'records.food.lowThresholdHelp' },
      { name: 'dailyUsage', type: 'decimal', label: 'fields.dailyUsage', help: 'records.food.dailyUsageHelp' },
      { name: 'restockAlert', type: 'toggle', label: 'fields.restockAlert' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, unit: 'kg', quantity: '', restockAlert: true }),
    validate: (v) => collect(['name', requireText(v, 'name')], ['quantity', parseDecimal(v.quantity as string) === null ? 'errors.number' : null]),
    dayOf: (e) => String(e.createdAt).slice(0, 10),
  },
  appointment: {
    kind: 'appointment',
    table: 'appointments',
    icon: 'calendar-outline',
    title: 'records.appointment.title',
    newTitle: 'records.appointment.new',
    fields: [
      pet,
      { name: 'type', type: 'select', label: 'fields.appointmentType', options: APPOINTMENT_TYPES, optionPrefix: 'options.appointmentType', required: true },
      { name: 'startsAt', type: 'datetime', label: 'fields.dateTime', required: true },
      { name: 'title', type: 'text', label: 'fields.appointmentTitle' },
      { name: 'provider', type: 'text', label: 'fields.provider' },
      { name: 'address', type: 'text', label: 'fields.address' },
      { name: 'phone', type: 'text', label: 'fields.phone' },
      { name: 'estimatedCost', type: 'money', label: 'fields.estimatedCost' },
      { name: 'remindMinutesBefore', type: 'intSelect', label: 'fields.remindBefore', options: ['0', '30', '60', '120', '1440'], optionPrefix: 'options.minutesBefore' },
      { name: 'status', type: 'select', label: 'fields.status', options: APPOINTMENT_STATUSES, optionPrefix: 'status' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, type: 'vet', startsAt: { day: c.today, time: '10:00' }, remindMinutesBefore: '60', status: 'scheduled', currency: c.currency }),
    validate: (v) => {
      const s = v.startsAt as { day: string | null; time: string | null };
      return collect(['startsAt', s && isValidDayKey(s.day) && isValidTime(s.time) ? null : 'errors.dateTime']);
    },
    dayOf: (e) => instantDay(e.startsAt),
  },
  activity: {
    kind: 'activity',
    table: 'activities',
    icon: 'walk-outline',
    title: 'records.activity.title',
    newTitle: 'records.activity.new',
    fields: [
      pet,
      { name: 'type', type: 'select', label: 'fields.activityType', options: ACTIVITY_TYPES, optionPrefix: 'options.activityType', required: true },
      { name: 'date', type: 'datetime', label: 'fields.dateTime', required: true },
      { name: 'durationMinutes', type: 'integer', label: 'fields.durationMinutes' },
      { name: 'distanceKm', type: 'decimal', label: 'fields.distanceKm', help: 'records.activity.distanceHelp', showIf: (v) => v.type === 'walk' },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, type: 'walk', date: { day: c.today, time: c.nowTime } }),
    validate: (v) => {
      const s = v.date as { day: string | null; time: string | null };
      return collect(['date', s && isValidDayKey(s.day) && isValidTime(s.time) ? null : 'errors.dateTime']);
    },
    dayOf: (e) => instantDay(e.date),
  },
  expense: {
    kind: 'expense',
    table: 'expenses',
    icon: 'wallet-outline',
    title: 'records.expense.title',
    newTitle: 'records.expense.new',
    fields: [
      { ...pet, required: false, optional: true, label: 'fields.petOptional' },
      { name: 'amount', type: 'money', label: 'fields.amount', required: true },
      { name: 'category', type: 'select', label: 'fields.category', options: EXPENSE_CATEGORIES, optionPrefix: 'options.expenseCategory', required: true },
      { name: 'date', type: 'date', label: 'fields.date', required: true },
      notes,
    ],
    defaults: (c) => ({ petId: c.petId, date: c.today, category: 'food', currency: c.currency }),
    fixed: () => ({ receiptDocumentId: null }),
    validate: (v) => collect(['amount', (parseDecimal(v.amount as string) ?? -1) >= 0 && String(v.amount ?? '').trim() !== '' ? null : 'errors.number'], ['date', isValidDayKey(v.date as string) ? null : 'errors.required']),
    dayOf: (e) => e.date as DayKey,
  },
};

/* ------------------------------------------------------------------ Conversion */

/** Money fields share the entity's `currency` column. */
const currencyField = (name: string) => (name === 'estimatedCost' || name === 'cost' || name === 'amount' ? 'currency' : null);

export function toForm(spec: RecordSpec, entity: Record<string, unknown>, unit: WeightUnit): FormValues {
  const out: FormValues = {};
  for (const f of spec.fields) {
    const v = entity[f.name];
    switch (f.type) {
      case 'decimal':
      case 'integer':
      case 'money':
        out[f.name] = v == null ? '' : String(v);
        break;
      case 'weight':
        out[f.name] = typeof v === 'number' ? String(fromKg(v, unit)) : '';
        break;
      case 'intSelect':
        out[f.name] = v == null ? null : String(v);
        break;
      case 'datetime':
        out[f.name] = typeof v === 'string' ? splitInstant(v) : { day: null, time: null };
        break;
      case 'times':
        out[f.name] = Array.isArray(v) ? v : [];
        break;
      case 'toggle':
        out[f.name] = v === true;
        break;
      default:
        out[f.name] = v ?? (f.type === 'text' || f.type === 'multiline' ? '' : null);
    }
    const cur = currencyField(f.name);
    if (cur) out.currency = entity.currency ?? null;
  }
  return out;
}

export function fromForm(spec: RecordSpec, v: FormValues, unit: WeightUnit, fallbackCurrency: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of spec.fields) {
    const raw = v[f.name];
    switch (f.type) {
      case 'text':
      case 'multiline': {
        const s = String(raw ?? '').trim();
        out[f.name] = s === '' ? null : s;
        break;
      }
      case 'decimal':
      case 'money':
        out[f.name] = parseDecimal(raw as string);
        break;
      case 'integer': {
        const n = parseDecimal(raw as string);
        out[f.name] = n == null ? null : Math.round(n);
        break;
      }
      case 'weight': {
        const n = parseDecimal(raw as string);
        out[f.name] = n == null ? null : toKg(n, unit);
        break;
      }
      case 'intSelect':
        out[f.name] = raw == null ? 0 : Number(raw);
        break;
      case 'datetime': {
        const s = raw as { day: string; time: string };
        out[f.name] = toInstant(s.day, s.time);
        break;
      }
      case 'times':
        out[f.name] = Array.isArray(raw) ? raw : [];
        break;
      case 'toggle':
        out[f.name] = raw === true;
        break;
      default:
        out[f.name] = raw ?? null;
    }
    const cur = currencyField(f.name);
    if (cur) out.currency = out[f.name] == null && f.name !== 'amount' ? null : ((v.currency as string | null) ?? fallbackCurrency);
  }
  // Text fields of some kinds are NOT NULL in the schema.
  if (spec.kind === 'expense') out.amount = out.amount ?? 0;
  if (spec.kind === 'food') out.quantity = out.quantity ?? 0;
  return out;
}

export function isRecordKind(k: string | undefined): k is RecordKind {
  return !!k && (RECORD_KINDS as readonly string[]).includes(k);
}
