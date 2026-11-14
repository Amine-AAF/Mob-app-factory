import { Row, Stack, Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

/**
 * Minimal accessible bar chart built with plain views (no chart dependency).
 * Screen readers get a text summary through `accessibilityLabel`.
 */
export function BarChart({ values, labels, accessibilityLabel, height = 80 }: { values: readonly number[]; labels?: readonly string[]; accessibilityLabel: string; height?: number }) {
  const theme = useTheme();
  const max = Math.max(1, ...values);
  return (
    <Stack gap={1} accessible accessibilityLabel={accessibilityLabel}>
      <Row gap={1} style={{ alignItems: 'flex-end', height }}>
        {values.map((v, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: Math.max(2, (v / max) * height),
              borderRadius: 3,
              backgroundColor: v > 0 ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </Row>
      {labels ? (
        <Row style={{ justifyContent: 'space-between' }}>
          {labels.map((l, i) => (
            <Text key={i} variant="caption" tone="subtle">
              {l}
            </Text>
          ))}
        </Row>
      ) : null}
    </Stack>
  );
}
