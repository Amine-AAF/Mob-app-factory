import { Text, useTheme } from '@factory/design-system';
import { TextInput, View, type TextInputProps } from 'react-native';

/** Labelled text input with hint and error, themed for light and dark mode. */
export function TextField({
  label,
  hint,
  error,
  optional,
  optionalLabel,
  style,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string | null; optional?: boolean; optionalLabel?: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing(1.5) }}>
      <Text variant="label">
        {label}
        {optional && optionalLabel ? <Text variant="caption" tone="subtle">{`  ·  ${optionalLabel}`}</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={theme.colors.textSubtle}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        style={[
          {
            minHeight: 48,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            paddingHorizontal: theme.spacing(3.5),
            paddingVertical: theme.spacing(2.5),
            fontSize: 16,
          },
          input.multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
          style,
        ]}
        {...input}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
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
