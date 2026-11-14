import { Chip, Icon, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Switch, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { addMonths, formatTime, fromDayKey, isValidTime, parseTime, toDayKey } from '@/domain/dates';
import { fmt, formatLocale } from '@/i18n';
import { clock } from '@/services/clock';

/* ------------------------------------------------------------------ Label wrapper */

export function Field({ label, required, help, error, children }: { label: string; required?: boolean; help?: string; error?: string | null; children: ReactNode }) {
  return (
    <Stack gap={1}>
      <Text variant="bodySmall" style={{ fontWeight: '700' }}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : help ? (
        <Text variant="caption" tone="subtle">
          {help}
        </Text>
      ) : null}
    </Stack>
  );
}

/* ------------------------------------------------------------------ Text */

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  required,
  help,
  error,
  testID,
  maxLength = 500,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  required?: boolean;
  help?: string;
  error?: string | null;
  testID?: string;
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const t = useTheme();
  return (
    <Field label={label} required={required} help={help} error={error}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={multiline ? 4000 : maxLength}
        autoFocus={autoFocus}
        accessibilityLabel={label}
        testID={testID}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 96 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: t.radius.md,
          borderWidth: 1.5,
          borderColor: error ? t.colors.danger : t.colors.border,
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          fontSize: 16,
        }}
      />
    </Field>
  );
}

/* ------------------------------------------------------------------ Select */

export function SelectChips<T extends string>({
  label,
  value,
  options,
  onChange,
  labelFor,
  iconFor,
  required,
  allowNone,
  testID,
}: {
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (v: T | null) => void;
  labelFor: (v: T) => string;
  iconFor?: (v: T) => IconName;
  required?: boolean;
  allowNone?: boolean;
  testID?: string;
}) {
  return (
    <Field label={label} required={required}>
      <Row wrap gap={2} testID={testID}>
        {options.map((o) => (
          <Chip key={o} label={labelFor(o)} icon={iconFor?.(o)} selected={value === o} onPress={() => onChange(allowNone && value === o ? null : o)} testID={testID ? `${testID}-${o}` : undefined} />
        ))}
      </Row>
    </Field>
  );
}

export function ToggleRow({ label, value, onChange, help, testID }: { label: string; value: boolean; onChange: (v: boolean) => void; help?: string; testID?: string }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 48 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{label}</Text>
        {help ? (
          <Text variant="caption" tone="subtle">
            {help}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        testID={testID}
        trackColor={{ true: t.colors.primary, false: t.colors.border }}
        thumbColor={t.colors.surface}
      />
    </Row>
  );
}

/* ------------------------------------------------------------------ Date */

function FieldButton({ text, placeholder, onPress, icon, label, testID, onClear }: { text: string; placeholder: string; onPress: () => void; icon: IconName; label: string; testID?: string; onClear?: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Row
      gap={0}
      style={{ minHeight: 48, borderRadius: t.radius.md, borderWidth: 1.5, borderColor: t.colors.border, backgroundColor: t.colors.surface, paddingHorizontal: 14 }}
    >
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${text || placeholder}`} testID={testID} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46 }}>
        <Icon name={icon} size={18} color={t.colors.textMuted} />
        <Text variant="body" tone={text ? 'default' : 'subtle'}>
          {text || placeholder}
        </Text>
      </Pressable>
      {onClear && text ? (
        <Pressable onPress={onClear} accessibilityRole="button" accessibilityLabel={tr('common.clear')} hitSlop={10}>
          <Icon name="close-circle" size={20} color={t.colors.textSubtle} />
        </Pressable>
      ) : null}
    </Row>
  );
}

export function DateField({ label, value, onChange, required, help, error, testID }: { label: string; value: string | null; onChange: (v: string | null) => void; required?: boolean; help?: string; error?: string | null; testID?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} required={required} help={help} error={error}>
      <FieldButton
        text={value ? fmt.day(value, { dateStyle: 'long' }) : ''}
        placeholder={t('common.pickDate')}
        icon="calendar-outline"
        label={label}
        onPress={() => setOpen(true)}
        testID={testID}
        onClear={required ? undefined : () => onChange(null)}
      />
      <CalendarModal
        visible={open}
        value={value}
        onClose={() => setOpen(false)}
        onPick={(d) => {
          onChange(d);
          setOpen(false);
        }}
      />
    </Field>
  );
}

/** Lightweight month calendar (no native date-picker dependency). */
export function CalendarModal({ visible, value, onPick, onClose }: { visible: boolean; value: string | null; onPick: (d: string) => void; onClose: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const today = clock.today();
  const [month, setMonth] = useState(() => (value ?? today).slice(0, 7) + '-01');
  const cells = useMemo(() => {
    const first = fromDayKey(month);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: offset }, () => null), ...Array.from({ length: days }, (_, i) => toDayKey(new Date(first.getFullYear(), first.getMonth(), i + 1)))];
  }, [month]);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(formatLocale(), { weekday: 'narrow' }).format(new Date(2026, 0, 5 + i))), []);
  const yearStep = (n: number) => setMonth(addMonths(month, n * 12));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: 20 }} onPress={onClose} accessibilityLabel={t('common.close')}>
        <Pressable style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, gap: 12 }} onPress={() => undefined}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={1}>
              <NavButton icon="play-back" label={t('common.previousYear')} onPress={() => yearStep(-1)} />
              <NavButton icon="chevron-back" label={t('common.previousMonth')} onPress={() => setMonth(addMonths(month, -1))} />
            </Row>
            <Text variant="subheading" style={{ textTransform: 'capitalize' }}>
              {fmt.month(month)}
            </Text>
            <Row gap={1}>
              <NavButton icon="chevron-forward" label={t('common.nextMonth')} onPress={() => setMonth(addMonths(month, 1))} />
              <NavButton icon="play-forward" label={t('common.nextYear')} onPress={() => yearStep(1)} />
            </Row>
          </Row>
          <View style={{ flexDirection: 'row' }}>
            {weekdays.map((w, i) => (
              <Text key={i} variant="caption" tone="subtle" center style={{ flex: 1 }}>
                {w}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((d, i) => {
              const selected = d === value;
              const isToday = d === today;
              return (
                <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                  {d ? (
                    <Pressable
                      onPress={() => onPick(d)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={fmt.day(d, { dateStyle: 'full' })}
                      style={{
                        flex: 1,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? theme.colors.primary : 'transparent',
                        borderWidth: isToday && !selected ? 1.5 : 0,
                        borderColor: theme.colors.primary,
                      }}
                    >
                      <Text variant="bodySmall" style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontWeight: isToday ? '800' : '500' }}>
                        {Number(d.slice(8))}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={() => onPick(today)} accessibilityRole="button" hitSlop={8}>
              <Text tone="primary" style={{ fontWeight: '700' }}>
                {t('common.today')}
              </Text>
            </Pressable>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text tone="muted" style={{ fontWeight: '700' }}>
                {t('common.cancel')}
              </Text>
            </Pressable>
          </Row>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function NavButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={18} color={theme.colors.text} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Time */

export function TimeField({ label, value, onChange, required, testID }: { label: string; value: string | null; onChange: (v: string | null) => void; required?: boolean; testID?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} required={required}>
      <FieldButton text={value ?? ''} placeholder={t('common.pickTime')} icon="time-outline" label={label} onPress={() => setOpen(true)} testID={testID} onClear={required ? undefined : () => onChange(null)} />
      <TimeModal
        visible={open}
        value={value}
        onClose={() => setOpen(false)}
        onPick={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </Field>
  );
}

export function TimeModal({ visible, value, onPick, onClose }: { visible: boolean; value: string | null; onPick: (v: string) => void; onClose: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const initial = value && isValidTime(value) ? parseTime(value) : { hour: 9, minute: 0 };
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const step = (setter: (fn: (n: number) => number) => void, delta: number, mod: number) => setter((n) => (n + delta + mod) % mod);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: 40 }} onPress={onClose}>
        <Pressable style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20, gap: 16 }} onPress={() => undefined}>
          <Row gap={6} style={{ justifyContent: 'center' }}>
            <TimeColumn value={hour} label={t('common.hours')} onUp={() => step(setHour, 1, 24)} onDown={() => step(setHour, -1, 24)} />
            <Text variant="display">:</Text>
            <TimeColumn value={minute} label={t('common.minutesLabel')} onUp={() => step(setMinute, 5, 60)} onDown={() => step(setMinute, -5, 60)} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={onClose} accessibilityRole="button" hitSlop={8}>
              <Text tone="muted" style={{ fontWeight: '700' }}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Pressable onPress={() => onPick(formatTime(hour, minute))} accessibilityRole="button" hitSlop={8} testID="time-ok">
              <Text tone="primary" style={{ fontWeight: '700' }}>
                {t('common.ok')}
              </Text>
            </Pressable>
          </Row>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TimeColumn({ value, onUp, onDown, label }: { value: number; onUp: () => void; onDown: () => void; label: string }) {
  return (
    <Stack gap={1} style={{ alignItems: 'center' }}>
      <NavButton icon="chevron-up" label={`${label} +`} onPress={onUp} />
      <Text variant="display" accessibilityLabel={`${label} ${value}`}>
        {String(value).padStart(2, '0')}
      </Text>
      <NavButton icon="chevron-down" label={`${label} -`} onPress={onDown} />
    </Stack>
  );
}

/** Editable list of 'HH:MM' times (meal times, dose reminders). */
export function TimesField({ label, value, onChange, help }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} help={help}>
      <Row wrap gap={2}>
        {value.map((time) => (
          <Chip key={time} label={`${time}  ✕`} selected onPress={() => onChange(value.filter((v) => v !== time))} />
        ))}
        <Chip label={t('common.addTime')} icon="add" selected={false} onPress={() => setOpen(true)} />
      </Row>
      <TimeModal
        visible={open}
        value={null}
        onClose={() => setOpen(false)}
        onPick={(v) => {
          onChange([...new Set([...value, v])].sort());
          setOpen(false);
        }}
      />
    </Field>
  );
}
