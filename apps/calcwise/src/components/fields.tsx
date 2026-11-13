import { Icon, Row, Text, useTheme, type IconName } from '@factory/design-system';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import type { Formatters } from '@/hooks/useFormat';
import { usePreferences } from '@/store/preferences';
import type { Dec } from '@/utils/decimal';

/* ----------------------------------------------------------- Number input state */

export interface NumberFieldState {
  text: string;
  setText: (t: string) => void;
  value: Dec | null;
  /** Non-empty text that isn't a valid number. */
  invalid: boolean;
}

export function useNumberField(f: Formatters, initial = ''): NumberFieldState {
  const [text, setText] = useState(initial);
  const trimmed = text.trim();
  const value = trimmed ? f.parse(trimmed) : null;
  return { text, setText, value, invalid: trimmed !== '' && value === null };
}

/** Pre-fills a field with a canonical number ("20") shown in the user's locale. */
export function localizedDefault(f: Formatters, canonicalValue: string): string {
  return canonicalValue.replace('.', f.separators.decimal);
}

/* ----------------------------------------------------------- NumberField */

export function NumberField({
  label,
  field,
  suffix,
  prefix,
  error,
  hint,
  allowNegative,
  integer,
  placeholder,
  testID,
}: {
  label: string;
  field: NumberFieldState;
  suffix?: string;
  prefix?: string;
  /** Translated error message from the calculator service. */
  error?: string | null;
  hint?: string;
  allowNegative?: boolean;
  integer?: boolean;
  placeholder?: string;
  testID?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const message = field.invalid ? t('errors.invalid_number') : error;
  const border = message ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;
  return (
    <View style={{ gap: 6 }}>
      <Text variant="bodySmall" tone="muted" style={{ fontWeight: '600' }} nativeID={testID ? `${testID}-label` : undefined}>
        {label}
      </Text>
      <Row gap={2} style={{ minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: theme.colors.surface, paddingHorizontal: 14 }}>
        {prefix ? (
          <Text tone="muted" style={{ fontWeight: '600' }}>
            {prefix}
          </Text>
        ) : null}
        <TextInput
          value={field.text}
          onChangeText={field.setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={integer ? 'number-pad' : allowNegative ? 'numeric' : 'decimal-pad'}
          inputMode={integer ? 'numeric' : 'decimal'}
          placeholder={placeholder ?? '0'}
          placeholderTextColor={theme.colors.textSubtle}
          maxLength={24}
          accessibilityLabel={label}
          accessibilityHint={hint}
          aria-invalid={!!message}
          maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
          testID={testID}
          style={{ flex: 1, fontSize: 20, fontWeight: '600', color: theme.colors.text, paddingVertical: 10, fontVariant: ['tabular-nums'] }}
        />
        {suffix ? (
          <Text tone="muted" style={{ fontWeight: '600' }}>
            {suffix}
          </Text>
        ) : null}
      </Row>
      {message ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/* ----------------------------------------------------------- Segmented control */

export function Segmented<T extends string>({ options, value, onChange, testID }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; testID?: string }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radiogroup" testID={testID} style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={o.label}
            testID={testID ? `${testID}-${o.value}` : undefined}
            style={{ flex: 1, minHeight: 40, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: selected ? theme.colors.surface : 'transparent' }}
          >
            <Text variant="bodySmall" numberOfLines={1} style={{ fontWeight: selected ? '700' : '500', color: selected ? theme.colors.primary : theme.colors.textMuted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ----------------------------------------------------------- Copy */

export async function copyText(text: string, haptics: boolean): Promise<void> {
  await Clipboard.setStringAsync(text);
  if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = usePreferences((s) => s.haptics);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);
  return (
    <Pressable
      onPress={() => copyText(text, haptics).then(() => setCopied(true))}
      accessibilityRole="button"
      accessibilityLabel={label ?? t('common.copyValue', { value: text })}
      hitSlop={8}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, minHeight: 36, borderRadius: theme.radius.pill, backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent' })}
    >
      <Icon name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? theme.colors.success : theme.colors.textMuted} />
      <Text variant="caption" tone={copied ? 'success' : 'muted'} accessibilityLiveRegion="polite">
        {copied ? t('common.copied') : t('common.copy')}
      </Text>
    </Pressable>
  );
}

/* ----------------------------------------------------------- Results */

export function ResultCard({ label, value, caption, testID }: { label: string; value: string; caption?: string; testID?: string }) {
  const theme = useTheme();
  return (
    <View testID={testID} accessible accessibilityLabel={`${label}: ${value}`} style={{ borderRadius: theme.radius.lg, padding: theme.spacing(4), gap: 4, backgroundColor: theme.colors.primarySoft }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="label" tone="primary">
          {label}
        </Text>
        <CopyButton text={value} />
      </Row>
      <Text variant="display" adjustsFontSizeToFit numberOfLines={1} style={{ fontVariant: ['tabular-nums'] }} testID={testID ? `${testID}-value` : undefined}>
        {value}
      </Text>
      {caption ? (
        <Text variant="bodySmall" tone="muted">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

export function ResultRow({ label, value, tone, strong }: { label: string; value: string; tone?: 'success' | 'danger' | 'primary'; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
        {label}
      </Text>
      <Text variant={strong ? 'subheading' : 'body'} tone={tone ?? 'default'} style={{ fontVariant: ['tabular-nums'], fontWeight: strong ? '700' : '600' }}>
        {value}
      </Text>
    </Row>
  );
}

/* ----------------------------------------------------------- Notes */

export function InfoNote({ text, icon = 'information-circle-outline', tone = 'muted' }: { text: string; icon?: IconName; tone?: 'muted' | 'warning' }) {
  const theme = useTheme();
  return (
    <Row gap={2} style={{ alignItems: 'flex-start', padding: theme.spacing(3), borderRadius: theme.radius.md, backgroundColor: tone === 'warning' ? theme.colors.warningSoft : theme.colors.surfaceAlt }}>
      <Icon name={icon} size={18} color={tone === 'warning' ? theme.colors.warning : theme.colors.textMuted} />
      <Text variant="caption" tone={tone === 'warning' ? 'warning' : 'muted'} style={{ flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </Row>
  );
}

/** Example chips: tapping one fills the form with a worked example. */
export function ExampleChips({ examples }: { examples: { label: string; apply: () => void }[] }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="subtle">
        {t('common.examples')}
      </Text>
      <Row gap={2} wrap>
        {examples.map((e) => (
          <Pressable
            key={e.label}
            onPress={e.apply}
            accessibilityRole="button"
            accessibilityLabel={t('common.tryExample', { example: e.label })}
            style={({ pressed }) => ({ paddingHorizontal: 12, minHeight: 34, justifyContent: 'center', borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface })}
          >
            <Text variant="caption" style={{ fontWeight: '600' }}>
              {e.label}
            </Text>
          </Pressable>
        ))}
      </Row>
    </View>
  );
}
