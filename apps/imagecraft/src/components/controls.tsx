import { Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, TextInput, View } from 'react-native';

export const COLOR_SWATCHES = ['#FFFFFF', '#000000', '#FF5C8A', '#5B3DF5', '#22C55E', '#FACC15', '#F97316', '#0EA5E9'] as const;

/** Colour choice with accessible names. */
export function ColorSwatches({ value, onChange, colors = COLOR_SWATCHES, label }: { value: string; onChange: (c: string) => void; colors?: readonly string[]; label: string }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Stack gap={2}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Row gap={2} wrap accessibilityRole="radiogroup">
        {colors.map((c) => {
          const selected = c.toLowerCase() === value.toLowerCase();
          return (
            <Pressable
              key={c}
              onPress={() => onChange(c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={tr('a11y.color', { color: c })}
              style={{ width: 40, height: 40, borderRadius: 20, padding: 3, borderWidth: 2, borderColor: selected ? t.colors.primary : 'transparent' }}
            >
              <View style={{ flex: 1, borderRadius: 17, backgroundColor: c, borderWidth: 1, borderColor: t.colors.border }} />
            </Pressable>
          );
        })}
      </Row>
    </Stack>
  );
}

export function ToggleRow({ label, value, onChange, hint, testID }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string; testID?: string }) {
  const t = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', minHeight: 48 }}>
      <Stack gap={0} style={{ flex: 1 }}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </Stack>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} testID={testID} trackColor={{ true: t.colors.primary, false: t.colors.border }} thumbColor={t.colors.surface} />
    </Row>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  testID?: string;
}) {
  const t = useTheme();
  return (
    <Stack gap={1} style={{ flex: 1 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textSubtle}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        accessibilityLabel={label}
        testID={testID}
        maxFontSizeMultiplier={t.maxFontSizeMultiplier}
        style={{
          minHeight: 48,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: t.radius.md,
          borderWidth: 1,
          borderColor: t.colors.border,
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          fontSize: 16,
        }}
      />
    </Stack>
  );
}

/** Small locked marker next to Premium options. */
export function LockMark() {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return <Icon name="diamond" size={12} color={t.colors.accent} accessibilityLabel={tr('premium.badge')} />;
}
