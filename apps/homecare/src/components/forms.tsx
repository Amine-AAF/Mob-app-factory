import { Chip, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Switch, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { addDays, isDayKey, toDayKey, type DayKey } from '@/domain/dates';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

import { MonthCalendar } from './MonthCalendar';

/* ----------------------------------------------------------------- Field shell */

export function Field({ label, hint, error, children, optional }: { label: string; hint?: string; error?: string | null; children: ReactNode; optional?: boolean }) {
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }}>
        {label}
        {optional ? ` · ${t('common.optional')}` : ''}
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
  multiline,
  keyboardType,
  error,
  hint,
  optional,
  testID,
  maxLength = 500,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string | null;
  hint?: string;
  optional?: boolean;
  testID?: string;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const theme = useTheme();
  return (
    <Field label={label} error={error} hint={hint} optional={optional}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoFocus={autoFocus}
        accessibilityLabel={label}
        testID={testID}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 96 : 48,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 16,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </Field>
  );
}

/** Amount input with its currency code; parsing happens in the form (domain/money.parseAmount). */
export function AmountField({ label, value, onChangeText, currency, onPressCurrency, error, optional, testID }: { label: string; value: string; onChangeText: (v: string) => void; currency: string; onPressCurrency?: () => void; error?: string | null; optional?: boolean; testID?: string }) {
  const theme = useTheme();
  return (
    <Field label={label} error={error} optional={optional}>
      <Row gap={2}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textSubtle}
          accessibilityLabel={`${label} (${currency})`}
          testID={testID}
          maxLength={18}
          maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
          style={{ flex: 1, minHeight: 48, borderWidth: 1, borderColor: error ? theme.colors.danger : theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, color: theme.colors.text, paddingHorizontal: 14, fontSize: 16 }}
        />
        <Pressable
          onPress={onPressCurrency}
          disabled={!onPressCurrency}
          accessibilityRole="button"
          accessibilityLabel={currency}
          style={{ minHeight: 48, minWidth: 72, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}
        >
          <Text variant="subheading">{currency}</Text>
        </Pressable>
      </Row>
    </Field>
  );
}

/* ----------------------------------------------------------------- Choices */

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  renderLabel,
  icon,
  allowNone,
  optional,
  testIDPrefix,
}: {
  label?: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
  renderLabel: (v: T) => string;
  icon?: (v: T) => IconName | undefined;
  allowNone?: boolean;
  optional?: boolean;
  testIDPrefix?: string;
}) {
  const content = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => (
        <Chip
          key={o}
          label={renderLabel(o)}
          icon={icon?.(o)}
          selected={value === o}
          onPress={() => onChange(allowNone && value === o ? null : o)}
          testID={testIDPrefix ? `${testIDPrefix}-${o}` : undefined}
        />
      ))}
    </View>
  );
  return label ? (
    <Field label={label} optional={optional}>
      {content}
    </Field>
  ) : (
    content
  );
}

/** Horizontal filter chips with an "All" option (null). */
export function FilterChips<T extends string>({ options, value, onChange, renderLabel, allLabel }: { options: readonly T[]; value: T | null; onChange: (v: T | null) => void; renderLabel: (v: T) => string; allLabel: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      <Chip label={allLabel} selected={value === null} onPress={() => onChange(null)} />
      {options.map((o) => (
        <Chip key={o} label={renderLabel(o)} selected={value === o} onPress={() => onChange(value === o ? null : o)} />
      ))}
    </ScrollView>
  );
}

export function Segmented<T extends string>({ options, value, onChange, renderLabel }: { options: readonly T[]; value: T; onChange: (v: T) => void; renderLabel: (v: T) => string }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 4 }}>
      {options.map((o) => {
        const selected = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            testID={`segment-${o}`}
            style={{ flex: 1, minHeight: 40, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" style={{ fontWeight: '700', color: selected ? theme.colors.primary : theme.colors.textMuted }} numberOfLines={1}>
              {renderLabel(o)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SwitchRow({ label, subtitle, value, onValueChange, disabled, testID }: { label: string; subtitle?: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const theme = useTheme();
  return (
    <Row style={{ minHeight: 52, justifyContent: 'space-between' }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{label}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        testID={testID}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor={theme.colors.surface}
      />
    </Row>
  );
}

/** Small integer stepper (quantity, days before, minutes). */
export function Stepper({ label, value, onChange, min = 0, max = 999, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  const theme = useTheme();
  const btn = (icon: IconName, delta: number, a11y: string) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={6}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}
    >
      <Icon name={icon} size={20} color={theme.colors.text} />
    </Pressable>
  );
  return (
    <Field label={label}>
      <Row gap={3} accessibilityRole="adjustable" accessibilityValue={{ min, max, now: value }}>
        {btn('remove', -step, `${label} −`)}
        <Text variant="heading" style={{ minWidth: 56, textAlign: 'center' }}>
          {value}
          {suffix ? ` ${suffix}` : ''}
        </Text>
        {btn('add', step, `${label} +`)}
      </Row>
    </Field>
  );
}

/* ----------------------------------------------------------------- Dates */

/**
 * Date input with a calendar sheet and quick shortcuts. Values are local day keys,
 * so a time-zone change never shifts the chosen day.
 */
export function DateField({ label, value, onChange, optional, clearable = true, shortcuts = 'future', error, testID }: { label: string; value: DayKey | null; onChange: (v: DayKey | null) => void; optional?: boolean; clearable?: boolean; shortcuts?: 'future' | 'past' | 'none'; error?: string | null; testID?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const today = toDayKey(clock.now());
  const [month, setMonth] = useState((value && isDayKey(value) ? value : today).slice(0, 7));
  const pick = (d: DayKey | null) => {
    onChange(d);
    setOpen(false);
  };
  const quick: { label: string; day: DayKey }[] =
    shortcuts === 'future'
      ? [
          { label: t('dates.today'), day: today },
          { label: t('dates.tomorrow'), day: addDays(today, 1) },
          { label: t('dates.inWeek'), day: addDays(today, 7) },
          { label: t('dates.inMonth'), day: addDays(today, 30) },
        ]
      : shortcuts === 'past'
        ? [
            { label: t('dates.today'), day: today },
            { label: t('dates.yesterday'), day: addDays(today, -1) },
          ]
        : [];
  return (
    <Field label={label} optional={optional} error={error}>
      <Pressable
        onPress={() => {
          setMonth((value ?? today).slice(0, 7));
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? fmt.day(value, 'long') : t('common.notSet')}`}
        testID={testID}
        style={{ minHeight: 48, borderWidth: 1, borderColor: error ? theme.colors.danger : theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <Icon name="calendar-outline" size={18} color={theme.colors.textMuted} />
        <Text variant="body" tone={value ? 'default' : 'subtle'} style={{ flex: 1 }}>
          {value ? fmt.day(value, 'long') : t('common.notSet')}
        </Text>
        {value && clearable ? (
          <Pressable onPress={() => onChange(null)} accessibilityRole="button" accessibilityLabel={t('common.clear')} hitSlop={10}>
            <Icon name="close-circle" size={18} color={theme.colors.textSubtle} />
          </Pressable>
        ) : null}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }} onPress={() => setOpen(false)} accessibilityLabel={t('common.close')}>
          <Pressable onPress={() => undefined} style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: 20, gap: 12 }}>
            <Text variant="heading">{label}</Text>
            {quick.length ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {quick.map((q) => (
                  <Chip key={q.label} label={q.label} selected={value === q.day} onPress={() => pick(q.day)} />
                ))}
              </View>
            ) : null}
            <MonthCalendar month={month} onMonthChange={setMonth} selected={value} onSelect={(d) => pick(d)} />
            <Row style={{ justifyContent: 'flex-end' }}>
              <Pressable onPress={() => setOpen(false)} accessibilityRole="button" style={{ padding: 12 }}>
                <Text variant="subheading" tone="primary">
                  {t('common.close')}
                </Text>
              </Pressable>
            </Row>
          </Pressable>
        </Pressable>
      </Modal>
    </Field>
  );
}

/** Hour/minute picker built from chips (no native dependency). */
export function TimeField({ label, hour, minute, onChange }: { label: string; hour: number; minute: number; onChange: (h: number, m: number) => void }) {
  const hours = [7, 8, 9, 10, 12, 14, 17, 18, 19, 20, 21];
  return (
    <Field label={label}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {hours.map((h) => (
          <Chip key={h} label={fmt.time(h, 0)} selected={hour === h && minute === 0} onPress={() => onChange(h, 0)} />
        ))}
      </ScrollView>
    </Field>
  );
}

/* ----------------------------------------------------------------- Option picker sheet */

export function PickerSheet<T extends string>({ visible, title, options, value, renderLabel, onSelect, onClose, allowNone, noneLabel }: { visible: boolean; title: string; options: readonly T[]; value: T | null; renderLabel: (v: T) => string; onSelect: (v: T | null) => void; onClose: () => void; allowNone?: boolean; noneLabel?: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const row = (v: T | null, text: string) => (
    <Pressable
      key={v ?? '__none'}
      onPress={() => {
        onSelect(v);
        onClose();
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: value === v }}
      style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 12, borderRadius: theme.radius.sm, backgroundColor: value === v ? theme.colors.primarySoft : 'transparent' }}
    >
      <Text variant="body" style={{ flex: 1 }}>
        {text}
      </Text>
      {value === v ? <Icon name="checkmark" size={20} color={theme.colors.primary} /> : null}
    </Pressable>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' }} onPress={onClose} accessibilityLabel={t('common.close')}>
        <Pressable onPress={() => undefined} style={{ maxHeight: '75%', backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: 20, gap: 8 }}>
          <Text variant="heading">{title}</Text>
          <ScrollView>
            {allowNone ? row(null, noneLabel ?? t('common.none')) : null}
            {options.map((o) => row(o, renderLabel(o)))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** A field that opens a PickerSheet (rooms, assets, currencies…). */
export function SelectField<T extends string>(props: { label: string; options: readonly T[]; value: T | null; renderLabel: (v: T) => string; onChange: (v: T | null) => void; allowNone?: boolean; noneLabel?: string; optional?: boolean; icon?: IconName; testID?: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Field label={props.label} optional={props.optional}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${props.label}: ${props.value ? props.renderLabel(props.value) : (props.noneLabel ?? t('common.none'))}`}
        testID={props.testID}
        style={{ minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        {props.icon ? <Icon name={props.icon} size={18} color={theme.colors.textMuted} /> : null}
        <Text variant="body" tone={props.value ? 'default' : 'subtle'} style={{ flex: 1 }} numberOfLines={1}>
          {props.value ? props.renderLabel(props.value) : (props.noneLabel ?? t('common.none'))}
        </Text>
        <Icon name="chevron-down" size={18} color={theme.colors.textSubtle} />
      </Pressable>
      <PickerSheet visible={open} title={props.label} options={props.options} value={props.value} renderLabel={props.renderLabel} onSelect={props.onChange} onClose={() => setOpen(false)} allowNone={props.allowNone} noneLabel={props.noneLabel} />
    </Field>
  );
}
