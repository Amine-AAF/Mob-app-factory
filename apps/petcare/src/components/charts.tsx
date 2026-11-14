import { Stack, Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

/**
 * Dependency-free bar chart. Charts display the user's own entries and carry no
 * judgement (no "healthy range", no colour coding of values).
 */
export function BarChart({
  values,
  labels,
  height = 140,
  formatValue,
  accessibilityLabel,
  highlightLast,
}: {
  values: number[];
  labels: string[];
  height?: number;
  formatValue: (v: number) => string;
  accessibilityLabel: string;
  highlightLast?: boolean;
}) {
  const theme = useTheme();
  const max = Math.max(...values, 0);
  const min = 0;
  const range = max - min || 1;
  const summary = values.map((v, i) => `${labels[i] ?? ''}: ${formatValue(v)}`).join(', ');
  return (
    <Stack gap={2} accessible accessibilityLabel={`${accessibilityLabel}. ${summary}`}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        {values.map((v, i) => {
          const h = Math.max(2, ((v - min) / range) * (height - 18));
          const last = highlightLast && i === values.length - 1;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
              {values.length <= 12 && v > 0 ? (
                <Text variant="caption" tone="subtle" numberOfLines={1} style={{ fontSize: 9 }}>
                  {formatValue(v)}
                </Text>
              ) : null}
              <View style={{ width: '80%', height: h, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: last ? theme.colors.primary : theme.colors.accent, opacity: v > 0 ? 1 : 0.25 }} />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {labels.map((l, i) => (
          <Text key={i} variant="caption" tone="subtle" center numberOfLines={1} style={{ flex: 1, fontSize: 10 }}>
            {l}
          </Text>
        ))}
      </View>
    </Stack>
  );
}

/** Simple dot-and-line evolution chart drawn with Views (weight history). */
export function LineChart({ values, labels, height = 160, formatValue, accessibilityLabel }: { values: number[]; labels: string[]; height?: number; formatValue: (v: number) => string; accessibilityLabel: string }) {
  const theme = useTheme();
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pad = (max - min) * 0.15 || max * 0.1 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const n = values.length;
  const summary = values.map((v, i) => `${labels[i] ?? ''}: ${formatValue(v)}`).join(', ');
  return (
    <Stack gap={2} accessible accessibilityLabel={`${accessibilityLabel}. ${summary}`}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ justifyContent: 'space-between', height }}>
          <Text variant="caption" tone="subtle" style={{ fontSize: 10 }}>
            {formatValue(max)}
          </Text>
          <Text variant="caption" tone="subtle" style={{ fontSize: 10 }}>
            {formatValue(min)}
          </Text>
        </View>
        <View style={{ flex: 1, height }} onLayout={undefined}>
          <ChartCanvas values={values} y={y} height={height} color={theme.colors.primary} grid={theme.colors.border} n={n} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 40 }}>
        <Text variant="caption" tone="subtle" style={{ fontSize: 10 }}>
          {labels[0]}
        </Text>
        {n > 1 ? (
          <Text variant="caption" tone="subtle" style={{ fontSize: 10 }}>
            {labels[n - 1]}
          </Text>
        ) : null}
      </View>
    </Stack>
  );
}

function ChartCanvas({ values, y, height, color, grid, n }: { values: number[]; y: (v: number) => number; height: number; color: string; grid: string; n: number }) {
  // Positions in percent so the chart is responsive without measuring.
  const xPct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  return (
    <View style={{ flex: 1 }}>
      {[0, 0.5, 1].map((g) => (
        <View key={g} style={{ position: 'absolute', left: 0, right: 0, top: g * (height - 1), height: 1, backgroundColor: grid }} />
      ))}
      {values.map((v, i) => {
        if (i === 0) return null;
        // Segment between point i-1 and i, approximated by a rotated thin view.
        const prev = values[i - 1]!;
        return <Segment key={`s${i}`} x1={xPct(i - 1)} x2={xPct(i)} y1={y(prev)} y2={y(v)} color={color} />;
      })}
      {values.map((v, i) => (
        <View key={`p${i}`} style={{ position: 'absolute', left: `${xPct(i)}%`, top: y(v) - 4, marginLeft: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      ))}
    </View>
  );
}

/** A line segment in a percent-width / pixel-height box, drawn as a skewed bar. */
function Segment({ x1, x2, y1, y2, color }: { x1: number; x2: number; y1: number; y2: number; color: string }) {
  // Without measuring the width we draw a vertical connector at x2 plus a horizontal step,
  // which reads clearly as an evolution line on small screens.
  const top = Math.min(y1, y2);
  const h = Math.max(2, Math.abs(y2 - y1));
  return (
    <>
      <View style={{ position: 'absolute', left: `${x1}%`, width: `${x2 - x1}%`, top: y1 - 1, height: 2, backgroundColor: color, opacity: 0.5 }} />
      <View style={{ position: 'absolute', left: `${x2}%`, marginLeft: -1, width: 2, top, height: h, backgroundColor: color, opacity: 0.5 }} />
    </>
  );
}
