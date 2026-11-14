import { Card, Chip, Icon, Text, useTheme, type IconName } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { CATEGORY_ICONS, HABIT_COLORS, HABIT_ICONS } from '@/constants';
import { validateFrequency } from '@/features/habits/schedule';
import { fmt } from '@/i18n';
import { CATEGORIES, type Frequency, type HabitCategory, type Tracking, type TrackingMode, type Weekday } from '@/types';

import { Field, HabitIcon, Segmented, Stepper, Swatch } from './ui';

export interface HabitDraft {
  name: string;
  description: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: Frequency;
  tracking: Tracking;
  durationMin: number | null;
  notes: string;
  templateId: string | null;
}

export function validateDraft(d: HabitDraft): Partial<Record<'name' | 'frequency' | 'target', string>> {
  const errors: Partial<Record<'name' | 'frequency' | 'target', string>> = {};
  if (!d.name.trim()) errors.name = 'errors.nameRequired';
  const f = validateFrequency(d.frequency);
  if (f) errors.frequency = f;
  if (d.tracking.mode !== 'check' && !(d.tracking.target > 0)) errors.target = 'errors.target';
  return errors;
}

const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
type FreqType = Frequency['type'];

function defaultFrequency(type: FreqType, prev: Frequency): Frequency {
  if (type === prev.type) return prev;
  switch (type) {
    case 'daily':
      return { type };
    case 'weekdays':
      return { type, days: [1, 2, 3, 4, 5] };
    case 'timesPerWeek':
      return { type, count: 3 };
    case 'timesPerMonth':
      return { type, count: 8 };
    case 'interval':
      return { type, everyDays: 2 };
  }
}

/** The habit form (create & edit). Pure UI: the screen saves. */
export function HabitEditor({ draft, onChange, errors, isEdit }: { draft: HabitDraft; onChange: (d: HabitDraft) => void; errors: ReturnType<typeof validateDraft>; isEdit: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const set = (patch: Partial<HabitDraft>) => onChange({ ...draft, ...patch });
  const f = draft.frequency;
  const monday = '2026-11-02';
  const dayLabel = (d: Weekday) => fmt.weekdayShort(fromDayKey(addDays(monday, (d + 6) % 7)));
  const setTracking = (patch: Partial<Tracking>) => set({ tracking: { ...draft.tracking, ...patch } });

  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <HabitIcon icon={draft.icon} color={draft.color} size={56} />
        <View style={{ flex: 1 }}>
          <Field label={t('editor.name')} value={draft.name} onChangeText={(name) => set({ name })} placeholder={t('editor.namePlaceholder')} maxLength={60} error={errors.name ? t(errors.name) : null} testID="habit-name" />
        </View>
      </View>
      <Field label={t('editor.description')} value={draft.description} onChangeText={(description) => set({ description })} placeholder={t('editor.optional')} maxLength={160} />

      <Section title={t('editor.icon')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {HABIT_ICONS.map((icon) => (
            <Pressable
              key={icon}
              onPress={() => set({ icon })}
              accessibilityRole="radio"
              accessibilityState={{ selected: draft.icon === icon }}
              accessibilityLabel={t('editor.iconOption', { name: icon })}
              style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: draft.icon === icon ? draft.color : theme.colors.surfaceAlt }}
            >
              <Icon name={icon as IconName} size={20} color={draft.icon === icon ? '#FFFFFF' : theme.colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title={t('editor.color')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {HABIT_COLORS.map((c, i) => (
            <Swatch key={c} color={c} selected={draft.color === c} onPress={() => set({ color: c })} label={t('editor.colorOption', { n: i + 1 })} />
          ))}
        </View>
      </Section>

      <Section title={t('editor.category')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c} label={t(`categories.${c}`)} icon={CATEGORY_ICONS[c] as IconName} selected={draft.category === c} onPress={() => set({ category: c })} />
          ))}
        </View>
      </Section>

      <Section title={t('editor.frequency')} hint={isEdit ? t('editor.ruleChangeHint') : undefined}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['daily', 'weekdays', 'timesPerWeek', 'timesPerMonth', 'interval'] as const).map((type) => (
            <Chip key={type} label={t(`frequency.type.${type}`)} selected={f.type === type} onPress={() => set({ frequency: defaultFrequency(type, f) })} testID={`freq-${type}`} />
          ))}
        </View>
        {f.type === 'weekdays' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {WEEK.map((d) => (
              <Chip key={d} label={dayLabel(d)} selected={f.days.includes(d)} onPress={() => set({ frequency: { type: 'weekdays', days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d] } })} />
            ))}
          </View>
        ) : null}
        {f.type === 'timesPerWeek' ? <Stepper label={t('frequency.timesPerWeek')} value={f.count} min={1} max={7} onChange={(count) => set({ frequency: { type: f.type, count } })} format={(v) => t('frequency.summary.timesPerWeek', { count: v })} /> : null}
        {f.type === 'timesPerMonth' ? <Stepper label={t('frequency.timesPerMonth')} value={f.count} min={1} max={31} onChange={(count) => set({ frequency: { type: f.type, count } })} format={(v) => t('frequency.summary.timesPerMonth', { count: v })} /> : null}
        {f.type === 'interval' ? <Stepper label={t('frequency.interval')} value={f.everyDays} min={2} max={365} onChange={(everyDays) => set({ frequency: { type: f.type, everyDays } })} format={(v) => t('frequency.summary.interval', { count: v })} /> : null}
        {errors.frequency ? (
          <Text variant="caption" tone="danger">
            {t(errors.frequency)}
          </Text>
        ) : null}
      </Section>

      <Section title={t('editor.tracking')}>
        <Segmented<TrackingMode>
          value={draft.tracking.mode}
          onChange={(mode) => setTracking(mode === 'check' ? { mode, target: 1, unit: null } : mode === 'duration' ? { mode, target: draft.tracking.mode === 'duration' ? draft.tracking.target : 20, unit: 'min' } : { mode, target: draft.tracking.mode === 'quantity' ? draft.tracking.target : 1, unit: draft.tracking.mode === 'quantity' ? draft.tracking.unit : null })}
          options={(['check', 'quantity', 'duration'] as const).map((m) => ({ value: m, label: t(`tracking.${m}`) }))}
        />
        <Text variant="caption" tone="muted">
          {t(`tracking.${draft.tracking.mode}Hint`)}
        </Text>
        {draft.tracking.mode !== 'check' ? (
          <Card tone="alt">
            <Text variant="caption" tone="muted">
              {t('editor.target')}
            </Text>
            <Stepper
              label={t('editor.target')}
              value={draft.tracking.target}
              min={0.5}
              max={100000}
              step={draft.tracking.mode === 'duration' ? 5 : draft.tracking.target >= 1000 ? 500 : draft.tracking.target >= 20 ? 5 : draft.tracking.target < 5 ? 0.5 : 1}
              onChange={(target) => setTracking({ target })}
              format={(v) => fmt.number(v)}
            />
            {draft.tracking.mode === 'quantity' ? (
              <Field label={t('editor.unit')} value={draft.tracking.unit ? t(`units.${draft.tracking.unit}`, { defaultValue: draft.tracking.unit }) : ''} onChangeText={(unit) => setTracking({ unit: unit.trim() ? unit.slice(0, 16) : null })} placeholder={t('editor.unitPlaceholder')} maxLength={16} />
            ) : null}
            {errors.target ? (
              <Text variant="caption" tone="danger">
                {t(errors.target)}
              </Text>
            ) : null}
          </Card>
        ) : null}
      </Section>

      <Section title={t('editor.duration')}>
        <Stepper label={t('editor.duration')} value={draft.durationMin ?? 0} min={0} max={480} step={5} onChange={(v) => set({ durationMin: v > 0 ? v : null })} format={(v) => (v > 0 ? t('editor.minutes', { count: v }) : t('editor.none'))} />
      </Section>

      <Field label={t('editor.notes')} value={draft.notes} onChangeText={(notes) => set({ notes })} placeholder={t('editor.optional')} multiline maxLength={500} />
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="label" tone="muted">
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

