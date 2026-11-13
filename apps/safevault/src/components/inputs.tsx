import { Icon, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

/**
 * Text inputs used across the vault.
 * Secret inputs: secureTextEntry by default, no autocorrect/suggestions, autofill disabled
 * (`importantForAutofill="no"`) so other apps/keyboards do not learn or offer vault content.
 */
export interface FieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string | null;
  testID?: string;
}

export function Field({ label, hint, error, multiline, testID, ...rest }: FieldProps) {
  const t = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.colors.textSubtle}
        multiline={multiline}
        autoCorrect={false}
        importantForAutofill="no"
        testID={testID}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={{
          minHeight: multiline ? 110 : 50,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: error ? t.colors.danger : t.colors.border,
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          fontSize: 16,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function SecretInput({ label, hint, error, testID, value, onChangeText, autoFocus, onSubmitEditing, right, ...rest }: FieldProps & { right?: React.ReactNode }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 50,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: error ? t.colors.danger : t.colors.border,
          backgroundColor: t.colors.surface,
          paddingLeft: 14,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          spellCheck={false}
          keyboardType={visible ? 'visible-password' : 'default'}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          testID={testID}
          maxFontSizeMultiplier={t.maxFontSizeMultiplier}
          style={{ flex: 1, color: t.colors.text, fontSize: 16, fontFamily: visible ? t.fonts.mono : undefined, minHeight: 48 }}
          {...rest}
        />
        {right}
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? tr('common.hide') : tr('common.show')}
          hitSlop={8}
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={20} color={t.colors.textMuted} />
        </Pressable>
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, borderRadius: t.radius.pill, backgroundColor: t.colors.surfaceAlt, paddingHorizontal: 16 }}>
      <Icon name="search" size={18} color={t.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        importantForAutofill="no"
        returnKeyType="search"
        style={{ flex: 1, color: t.colors.text, fontSize: 16, minHeight: 46 }}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel={tr('common.clear')} hitSlop={10}>
          <Icon name="close-circle" size={18} color={t.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Toggle({ label, description, value, onChange, disabled, testID }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; testID?: string }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      testID={testID}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, opacity: disabled ? 0.5 : 1 }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{label}</Text>
        {description ? (
          <Text variant="bodySmall" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: value ? t.colors.primary : t.colors.border, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.colors.surface }} />
      </View>
    </Pressable>
  );
}

export function Stepper({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const btn = (delta: number, icon: 'remove' | 'add', a11y: string) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      onLongPress={() => onChange(Math.min(max, Math.max(min, value + delta * 5)))}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.surfaceAlt }}
    >
      <Icon name={icon} size={20} color={t.colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }} accessible={false}>
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      {btn(-step, 'remove', tr('common.decrease', { label }))}
      <Text variant="heading" style={{ minWidth: 40, textAlign: 'center' }} accessibilityLiveRegion="polite">
        {String(value)}
      </Text>
      {btn(step, 'add', tr('common.increase', { label }))}
    </View>
  );
}
