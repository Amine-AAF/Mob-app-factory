import { Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

/**
 * Lightweight, accessible charts drawn with Views (no SVG dependency).
 * Each chart exposes a text summary to screen readers.
 */
export function BarChart({ data, height = 120, color, summary, formatValue }: { data: { label: string; value: number | null; highlight?: boolean }[]; height?: number; color?: string; summary: string; formatValue?: (v: number) => string }) {
  const theme = useTheme();
  const max = Math.max(0, ...data.map((d) => d.value ?? 0));
  const c = color ?? theme.colors.primary;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ gap: 6 }}>
      {formatValue && max > 0 ? (
        <Text variant="caption" tone="subtle">
          {formatValue(max)}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: height + 20 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ width: '100%', height, justifyContent: 'flex-end', borderRadius: 6, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
              {d.value !== null && max > 0 ? <View style={{ height: Math.max(d.value > 0 ? 3 : 0, (d.value / max) * height), backgroundColor: d.highlight ? c : `${c}AA`, borderRadius: 6 }} /> : null}
            </View>
            <Text variant="caption" tone={d.highlight ? 'primary' : 'subtle'} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Trend as dots on a band (min..max), for consumption over months. */
export function DotTrend({ data, height = 90, summary }: { data: { label: string; value: number }[]; height?: number; summary: string }) {
  const theme = useTheme();
  if (!data.length) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: height + 20 }}>
      {data.map((d, i) => {
        const y = ((d.value - min) / span) * (height - 12);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View style={{ height, width: '100%', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: 2, height: y + 6, backgroundColor: theme.colors.primarySoft }} />
              <View style={{ position: 'absolute', bottom: y, width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary, borderWidth: 2, borderColor: theme.colors.surface }} />
            </View>
            <Text variant="caption" tone="subtle" numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Horizontal share bars (category breakdown). */
export function ShareBars({ rows }: { rows: { label: string; value: string; share: number; color?: string }[] }) {
  const theme = useTheme();
  const palette = [theme.colors.primary, theme.colors.accent, theme.colors.success, theme.colors.warning, theme.colors.danger, theme.colors.textMuted];
  return (
    <View style={{ gap: 10 }}>
      {rows.map((r, i) => (
        <View key={r.label} accessible accessibilityLabel={`${r.label}: ${r.value}, ${Math.round(r.share * 100)}%`} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySmall">{r.label}</Text>
            <Text variant="bodySmall" style={{ fontWeight: '700' }}>
              {r.value}
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${Math.max(2, Math.round(r.share * 100))}%`, borderRadius: 4, backgroundColor: r.color ?? palette[i % palette.length] }} />
          </View>
        </View>
      ))}
    </View>
  );
}
