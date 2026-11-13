import { Button, Chip, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { addDays } from '@factory/app-core';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import type { DayKey } from '@/domain/types';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { pickFromLibrary, takePhoto, type PickResult } from '@/services/photos';

import { MonthCalendar } from './MonthCalendar';
import { PlantPhoto } from './PlantPhoto';

export function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  const { t } = useTranslation();
  return (
    <Text variant="label" tone="muted">
      {optional ? `${children} · ${t('common.optional')}` : children}
    </Text>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  optional,
  keyboardType,
  maxLength = 500,
  error,
  testID,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  optional?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  error?: string | null;
  testID?: string;
  autoFocus?: boolean;
}) {
  const theme = useTheme();
  return (
    <Stack gap={1}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label}
        testID={testID}
        autoFocus={autoFocus}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 96 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 16,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
        }}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
  icons,
  optional,
}: {
  label?: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  render: (v: T) => string;
  icons?: Partial<Record<T, IconName>>;
  optional?: boolean;
}) {
  return (
    <Stack gap={1}>
      {label ? <FieldLabel optional={optional}>{label}</FieldLabel> : null}
      <Row wrap gap={2}>
        {options.map((o) => (
          <Chip key={o} label={render(o)} selected={value === o} onPress={() => onChange(o)} icon={icons?.[o]} />
        ))}
      </Row>
    </Stack>
  );
}

/** Calendar-day field with quick choices and a month picker. Future days can be disallowed. */
export function DateField({
  label,
  value,
  onChange,
  optional,
  allowFuture = true,
  allowPast = true,
  clearable,
  testID,
}: {
  label: string;
  value: DayKey | null;
  onChange: (v: DayKey | null) => void;
  optional?: boolean;
  allowFuture?: boolean;
  allowPast?: boolean;
  clearable?: boolean;
  testID?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const today = clock.today();
  return (
    <Stack gap={1}>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <Row gap={2}>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? fmt.day(value, { dateStyle: 'full' }) : t('common.notSet')}`}
          testID={testID}
          style={{ flex: 1, minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface }}
        >
          <Icon name="calendar-outline" size={18} color={theme.colors.textMuted} />
          <Text tone={value ? 'default' : 'subtle'}>{value ? fmt.day(value, { dateStyle: 'medium' }) : t('common.notSet')}</Text>
        </Pressable>
        {clearable && value ? <IconButton icon="close-circle-outline" label={t('common.clear')} onPress={() => onChange(null)} /> : null}
      </Row>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: 20 }} onPress={() => setOpen(false)} accessibilityLabel={t('common.close')}>
          <Pressable style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, gap: 12 }} onPress={() => undefined}>
            <Text variant="heading">{label}</Text>
            <Row wrap gap={2}>
              {allowPast ? <Chip label={t('dates.yesterday')} selected={value === addDays(today, -1)} onPress={() => (onChange(addDays(today, -1)), setOpen(false))} /> : null}
              <Chip label={t('dates.today')} selected={value === today} onPress={() => (onChange(today), setOpen(false))} />
              {allowFuture ? <Chip label={t('dates.tomorrow')} selected={value === addDays(today, 1)} onPress={() => (onChange(addDays(today, 1)), setOpen(false))} /> : null}
            </Row>
            <MonthCalendar
              initial={value ?? today}
              selected={value}
              isDisabled={(d) => (!allowFuture && d > today) || (!allowPast && d < today)}
              onSelect={(d) => {
                onChange(d);
                setOpen(false);
              }}
            />
            <Button label={t('common.cancel')} variant="secondary" size="md" onPress={() => setOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </Stack>
  );
}

/** Photo picker field. Explains clearly when the camera permission is refused. */
export function PhotoField({ label, value, onChange, disabled, disabledHint }: { label: string; value: string | null; onChange: (path: string | null) => void; disabled?: boolean; disabledHint?: ReactNode }) {
  const { t } = useTranslation();
  const handle = (r: PickResult) => {
    if (r.status === 'ok') onChange(r.path);
    else if (r.status === 'denied') Alert.alert(t('photos.deniedTitle'), t('photos.deniedBody'));
    else if (r.status === 'error') Alert.alert(t('common.error'), t('photos.error'));
  };
  return (
    <Stack gap={2}>
      <FieldLabel optional>{label}</FieldLabel>
      {value ? <PlantPhoto path={value} height={160} label={label} /> : null}
      {disabled ? (
        disabledHint
      ) : (
        <Row wrap gap={2}>
          <Button size="md" variant="secondary" icon="images-outline" label={t('photos.gallery')} onPress={() => void pickFromLibrary().then(handle)} />
          <Button size="md" variant="secondary" icon="camera-outline" label={t('photos.camera')} onPress={() => void takePhoto().then(handle)} />
          {value ? <Button size="md" variant="ghost" icon="trash-outline" label={t('photos.remove')} onPress={() => onChange(null)} /> : null}
        </Row>
      )}
      <Text variant="caption" tone="subtle">
        {t('photos.privacy')}
      </Text>
    </Stack>
  );
}

/** Integer stepper (frequency in days, leaf count…). */
export function Stepper({ label, value, onChange, min = 1, max = 365, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      <FieldLabel>{label}</FieldLabel>
      <Row gap={2}>
        <IconButton icon="remove-circle-outline" label={t('common.decrease')} onPress={() => onChange(Math.max(min, value - 1))} />
        <View style={{ minWidth: 90, alignItems: 'center', paddingVertical: 8, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }} accessible accessibilityLabel={`${label}: ${value} ${suffix ?? ''}`}>
          <Text variant="heading">
            {value}
            {suffix ? ` ${suffix}` : ''}
          </Text>
        </View>
        <IconButton icon="add-circle-outline" label={t('common.increase')} onPress={() => onChange(Math.min(max, value + 1))} />
      </Row>
    </Stack>
  );
}

export function SwitchRow({ label, subtitle, value, onChange, testID }: { label: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; testID?: string }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 6 }}
    >
      <View style={{ flex: 1 }}>
        <Text>{label}</Text>
        {subtitle ? (
          <Text variant="bodySmall" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: value ? theme.colors.primary : theme.colors.border, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' }} />
      </View>
    </Pressable>
  );
}
