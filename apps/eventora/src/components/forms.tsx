import { Chip, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Switch, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { addDaysTo, isValidDate, localToday, monthGrid } from '@/domain/time';
import { fmt } from '@/i18n';

/* ----------------------------------------------------------------- Fields */

export function Field({ label, error, hint, children }: { label: string; error?: string | null; hint?: string; children: ReactNode }) {
  return (
    <Stack gap={1}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      {children}
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  multiline,
  keyboardType,
  autoCapitalize,
  maxLength = 500,
  testID,
  secureHint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string | null;
  hint?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  maxLength?: number;
  testID?: string;
  /** Marks private fields (contact, dietary) with a lock. */
  secureHint?: boolean;
}) {
  const t = useTheme();
  return (
    <Field label={secureHint ? `${label} 🔒` : label} error={error} hint={hint}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        accessibilityLabel={label}
        testID={testID}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 96 : 48,
          borderWidth: 1,
          borderColor: error ? t.colors.danger : t.colors.border,
          borderRadius: t.radius.md,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 8,
          color: t.colors.text,
          backgroundColor: t.colors.surface,
          fontSize: 16,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </Field>
  );
}

export function Stepper({ label, value, onChange, min = 0, max = 99, hint }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; hint?: string }) {
  const t = useTheme();
  const btn = (icon: IconName, next: number, a11y: string, disabled: boolean) => (
    <Pressable
      onPress={() => onChange(next)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surfaceAlt, opacity: disabled ? 0.4 : 1 }}
    >
      <Icon name={icon} size={20} color={t.colors.text} />
    </Pressable>
  );
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="subtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <Row gap={2} accessibilityLabel={`${label}: ${value}`}>
        {btn('remove', Math.max(min, value - 1), `${label} −`, value <= min)}
        <Text variant="heading" style={{ minWidth: 32, textAlign: 'center' }}>
          {value}
        </Text>
        {btn('add', Math.min(max, value + 1), `${label} +`, value >= max)}
      </Row>
    </Row>
  );
}

export function ToggleRow({ label, value, onChange, hint, testID }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string; testID?: string }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="subtle">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} testID={testID} trackColor={{ true: t.colors.primary, false: t.colors.border }} thumbColor={t.colors.surface} />
    </Row>
  );
}

/** Single choice among a few options, rendered as wrapping chips. */
export function ChoiceChips<V extends string>({ label, options, value, onChange, icons }: { label?: string; options: readonly { value: V; label: string }[]; value: V; onChange: (v: V) => void; icons?: Partial<Record<V, IconName>> }) {
  const content = (
    <Row gap={2} wrap>
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} icon={icons?.[o.value]} />
      ))}
    </Row>
  );
  return label ? <Field label={label}>{content}</Field> : content;
}

export function MultiChips<V extends string>({ options, values, onChange }: { options: readonly { value: V; label: string }[]; values: readonly V[]; onChange: (v: V[]) => void }) {
  return (
    <Row gap={2} wrap>
      {options.map((o) => {
        const on = values.includes(o.value);
        return <Chip key={o.value} label={o.label} selected={on} onPress={() => onChange(on ? values.filter((x) => x !== o.value) : [...values, o.value])} />;
      })}
    </Row>
  );
}

/* --------------------------------------------------------------- Pickers */

function PickerButton({ label, value, placeholder, onPress, onClear, icon }: { label: string; value: string | null; placeholder: string; onPress: () => void; onClear?: () => void; icon: IconName }) {
  const t = useTheme();
  return (
    <Field label={label}>
      <Row gap={2}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ?? placeholder}`}
          style={{ flex: 1, minHeight: 48, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.colors.surface }}
        >
          <Icon name={icon} size={18} color={t.colors.textMuted} />
          <Text tone={value ? 'default' : 'subtle'}>{value ?? placeholder}</Text>
        </Pressable>
        {value && onClear ? (
          <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={`${label} ✕`} hitSlop={8} style={{ padding: 8 }}>
            <Icon name="close-circle" size={20} color={t.colors.textSubtle} />
          </Pressable>
        ) : null}
      </Row>
    </Field>
  );
}

function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: t.colors.overlay, justifyContent: 'center', padding: 20 }} onPress={onClose} accessibilityLabel="✕">
        <Pressable style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: 16, gap: 12, maxHeight: '90%' }} onPress={() => undefined}>
          <Text variant="heading">{title}</Text>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Month calendar; `marks` adds a dot under days (used by the task calendar too). */
export function MonthCalendar({ month, onMonthChange, selected, onSelect, marks, today }: { month: { y: number; m: number }; onMonthChange: (m: { y: number; m: number }) => void; selected?: string | null; onSelect: (d: string) => void; marks?: ReadonlyMap<string, 'normal' | 'alert'>; today: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const cells = monthGrid(month.y, month.m);
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(month.y, month.m - 1 + delta, 1));
    onMonthChange({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
  };
  const weekdays = ['2027-03-01', '2027-03-02', '2027-03-03', '2027-03-04', '2027-03-05', '2027-03-06', '2027-03-07'].map((d) => fmt.weekday(d));
  return (
    <Stack gap={2}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel={tr('calendar.previous')} hitSlop={10} style={{ padding: 8 }}>
          <Icon name="chevron-back" size={20} color={t.colors.text} />
        </Pressable>
        <Text variant="subheading" accessibilityRole="header">
          {fmt.monthYear(month.y, month.m)}
        </Text>
        <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel={tr('calendar.next')} hitSlop={10} style={{ padding: 8 }}>
          <Icon name="chevron-forward" size={20} color={t.colors.text} />
        </Pressable>
      </Row>
      <View style={{ flexDirection: 'row' }}>
        {weekdays.map((w, i) => (
          <Text key={i} variant="caption" tone="subtle" style={{ flex: 1, textAlign: 'center' }}>
            {w}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          const isSel = d === selected;
          const mark = d ? marks?.get(d) : undefined;
          return (
            <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
              {d ? (
                <Pressable
                  onPress={() => onSelect(d)}
                  accessibilityRole="button"
                  accessibilityLabel={fmt.day(d, 'full')}
                  accessibilityState={{ selected: isSel }}
                  style={{ flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? t.colors.primary : 'transparent', borderWidth: d === today && !isSel ? 1 : 0, borderColor: t.colors.primary }}
                >
                  <Text variant="bodySmall" style={{ color: isSel ? t.colors.onPrimary : t.colors.text, fontWeight: d === today ? '700' : '400' }}>
                    {Number(d.slice(8))}
                  </Text>
                  {mark ? <View style={{ position: 'absolute', bottom: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? t.colors.onPrimary : mark === 'alert' ? t.colors.danger : t.colors.accent }} /> : null}
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </View>
    </Stack>
  );
}

export function DateField({ label, value, onChange, optional, testID }: { label: string; value: string | null; onChange: (v: string | null) => void; optional?: boolean; testID?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const today = localToday(new Date());
  const base = value && isValidDate(value) ? value : today;
  const [month, setMonth] = useState({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) });
  return (
    <View testID={testID}>
      <PickerButton label={label} icon="calendar-outline" value={value ? fmt.day(value, 'full') : null} placeholder={t('common.pickDate')} onPress={() => setOpen(true)} onClear={optional ? () => onChange(null) : undefined} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <MonthCalendar
          month={month}
          onMonthChange={setMonth}
          selected={value}
          today={today}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
        />
        <Row gap={2} wrap>
          {[0, 7, 30].map((n) => (
            <Chip
              key={n}
              label={n === 0 ? t('calendar.today') : t('calendar.inDays', { count: n })}
              selected={false}
              onPress={() => {
                onChange(addDaysTo(today, n));
                setOpen(false);
              }}
            />
          ))}
        </Row>
      </Sheet>
    </View>
  );
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function TimeField({ label, value, onChange, optional, testID }: { label: string; value: string | null; onChange: (v: string | null) => void; optional?: boolean; testID?: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [open, setOpen] = useState(false);
  const [h, m] = (value ?? '18:00').split(':').map(Number) as [number, number];
  const set = (hh: number, mm: number) => onChange(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  const cell = (n: number, selected: boolean, onPress: () => void, a11y: string) => (
    <Pressable key={n} onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} accessibilityState={{ selected }} style={{ width: 52, height: 40, margin: 3, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? t.colors.primary : t.colors.surfaceAlt }}>
      <Text variant="bodySmall" style={{ color: selected ? t.colors.onPrimary : t.colors.text, fontWeight: '600' }}>
        {String(n).padStart(2, '0')}
      </Text>
    </Pressable>
  );
  return (
    <View testID={testID}>
      <PickerButton label={label} icon="time-outline" value={value ? fmt.time(value) : null} placeholder={tr('common.pickTime')} onPress={() => setOpen(true)} onClear={optional ? () => onChange(null) : undefined} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <Text variant="label" tone="muted">
          {tr('calendar.hour')}
        </Text>
        <ScrollView style={{ maxHeight: 200 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{HOURS.map((x) => cell(x, value != null && x === h, () => set(x, value ? m : 0), `${x} h`))}</View>
        </ScrollView>
        <Text variant="label" tone="muted">
          {tr('calendar.minute')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{MINUTES.map((x) => cell(x, value != null && x === m, () => set(value ? h : 18, x), `${x} min`))}</View>
        <Pressable onPress={() => setOpen(false)} accessibilityRole="button" style={{ alignSelf: 'flex-end', padding: 10 }}>
          <Text tone="primary" style={{ fontWeight: '700' }}>
            {tr('common.done')}
          </Text>
        </Pressable>
      </Sheet>
    </View>
  );
}

/** Generic list picker in a sheet (currency, time zone, vendor, guest…). */
export function SelectField<V extends string>({ label, value, options, onChange, placeholder, searchable, optional, icon = 'list-outline' }: { label: string; value: V | null; options: readonly { value: V; label: string; hint?: string }[]; onChange: (v: V | null) => void; placeholder?: string; searchable?: boolean; optional?: boolean; icon?: IconName }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = options.find((o) => o.value === value);
  const shown = q ? options.filter((o) => `${o.label} ${o.hint ?? ''}`.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <View>
      <PickerButton label={label} icon={icon} value={current?.label ?? null} placeholder={placeholder ?? tr('common.choose')} onPress={() => setOpen(true)} onClear={optional ? () => onChange(null) : undefined} />
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        {searchable ? (
          <TextInput value={q} onChangeText={setQ} placeholder={tr('common.search')} placeholderTextColor={t.colors.textSubtle} accessibilityLabel={tr('common.search')} style={{ borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.md, paddingHorizontal: 12, minHeight: 44, color: t.colors.text }} />
        ) : null}
        <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
          {shown.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => {
                onChange(o.value);
                setOpen(false);
                setQ('');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: o.value === value }}
              style={{ paddingVertical: 12, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: t.colors.border }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: o.value === value ? '700' : '400' }}>{o.label}</Text>
                {o.hint ? (
                  <Text variant="caption" tone="subtle">
                    {o.hint}
                  </Text>
                ) : null}
              </View>
              {o.value === value ? <Icon name="checkmark" size={18} color={t.colors.primary} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </Sheet>
    </View>
  );
}
