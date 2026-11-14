import { Icon, Row, useTheme } from '@factory/design-system';
import { TextInput } from 'react-native';

/** Accessible search input styled with the design-system tokens. */
export function SearchField({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  testID,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <Row
      gap={2}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radius.pill,
        paddingHorizontal: 14,
        minHeight: 48,
      }}
    >
      <Icon name="search" size={18} color={theme.colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        autoCorrect={false}
        style={{ flex: 1, color: theme.colors.text, fontSize: 16, paddingVertical: 10 }}
        maxFontSizeMultiplier={theme.maxFontSizeMultiplier}
        testID={testID}
      />
    </Row>
  );
}
