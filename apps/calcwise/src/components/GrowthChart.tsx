import { Row, Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

/**
 * Stacked bar chart (deposits vs. interest) drawn with plain Views: no chart
 * dependency. Values are pre-converted to numbers for layout only; the exact
 * figures are shown as text in the table and in the accessibility label.
 */
export interface GrowthBar {
  label: string;
  base: number;
  growth: number;
}

export function GrowthChart({ bars, baseLabel, growthLabel, summary }: { bars: GrowthBar[]; baseLabel: string; growthLabel: string; summary: string }) {
  const theme = useTheme();
  const max = Math.max(1, ...bars.map((b) => b.base + b.growth));
  // Keep at most ~12 bars readable: sample evenly, always keep the last one.
  const step = Math.ceil(bars.length / 12);
  const shown = bars.filter((_, i) => i % step === step - 1 || i === bars.length - 1);
  return (
    <View accessible accessibilityLabel={summary} style={{ gap: 8 }}>
      <View style={{ height: 160, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        {shown.map((b) => {
          const total = b.base + b.growth;
          const height = Math.max(2, (total / max) * 150);
          const growthShare = total > 0 ? b.growth / total : 0;
          return (
            <View key={b.label} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View style={{ width: '100%', height, borderRadius: 6, overflow: 'hidden', backgroundColor: theme.colors.primary }}>
                <View style={{ height: `${growthShare * 100}%`, backgroundColor: theme.colors.accent }} />
              </View>
              <Text variant="caption" tone="subtle" numberOfLines={1}>
                {b.label}
              </Text>
            </View>
          );
        })}
      </View>
      <Row gap={4}>
        <Legend color={theme.colors.primary} label={baseLabel} />
        <Legend color={theme.colors.accent} label={growthLabel} />
      </Row>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Row gap={2}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color }} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </Row>
  );
}
