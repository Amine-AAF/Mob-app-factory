import { Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

/** Compact numeric table (amortization, savings by year). Right-aligned tabular figures. */
export function Table({ headers, rows, testID }: { headers: string[]; rows: string[][]; testID?: string }) {
  const theme = useTheme();
  const cell = (text: string, i: number, header: boolean) => (
    <Text
      key={i}
      variant="caption"
      numberOfLines={1}
      adjustsFontSizeToFit
      style={{ flex: i === 0 ? 0.6 : 1, textAlign: i === 0 ? 'left' : 'right', fontVariant: ['tabular-nums'], fontWeight: header ? '700' : '500', color: header ? theme.colors.textMuted : theme.colors.text }}
    >
      {text}
    </Text>
  );
  return (
    <View testID={testID} accessibilityRole="list">
      <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>{headers.map((h, i) => cell(h, i, true))}</View>
      {rows.map((r, ri) => (
        <View key={ri} accessible accessibilityLabel={r.map((c, i) => `${headers[i]}: ${c}`).join(', ')} style={{ flexDirection: 'row', gap: 6, paddingVertical: 7, backgroundColor: ri % 2 ? theme.colors.surfaceAlt : 'transparent' }}>
          {r.map((c, i) => cell(c, i, false))}
        </View>
      ))}
    </View>
  );
}
