import { Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { View } from 'react-native';

/**
 * Lightweight charts drawn with Views (no SVG dependency). Each chart exposes a text
 * summary for screen readers.
 */
export function BarChart({ data, height = 120, color, summary }: { data: { label: string; value: number }[]; height?: number; color?: string; summary: string }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View accessible accessibilityLabel={summary} style={{ gap: 6 }}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        {data.map((d, i) => (
          <View key={`${d.label}-${i}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Text variant="caption" tone="muted">
              {d.value > 0 ? d.value : ''}
            </Text>
            <View style={{ width: '70%', height: `${Math.max(d.value > 0 ? 6 : 2, (d.value / max) * 85)}%`, borderRadius: 6, backgroundColor: d.value > 0 ? (color ?? theme.colors.primary) : theme.colors.surfaceAlt }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {data.map((d, i) => (
          <Text key={`${d.label}-l${i}`} variant="caption" tone="subtle" center style={{ flex: 1 }} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** Growth line: dots joined by segments, plotted on measured values only (no interpolation shown as data). */
export function LineChart({ points, height = 140, color, summary, unit }: { points: { label: string; value: number }[]; height?: number; color?: string; summary: string; unit: string }) {
  const theme = useTheme();
  const [w, setW] = useState(0);
  const stroke = color ?? theme.colors.primary;
  if (points.length === 0) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 12;
  const inner = Math.max(0, w - pad * 2);
  const xs = points.map((_, i) => pad + (points.length === 1 ? inner / 2 : (i / (points.length - 1)) * inner));
  const ys = points.map((p) => ((p.value - min) / span) * (height - pad * 2) + pad);
  return (
    <View accessible accessibilityLabel={summary} style={{ gap: 6 }}>
      <View style={{ height, position: 'relative' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 &&
          points.map((_, i) => {
            if (i === 0) return null;
            const x1 = xs[i - 1]!;
            const x2 = xs[i]!;
            const y1 = ys[i - 1]!;
            const y2 = ys[i]!;
            const len = Math.hypot(x2 - x1, y2 - y1);
            const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
            return (
              <View
                key={`seg-${i}`}
                style={{
                  position: 'absolute',
                  left: (x1 + x2) / 2 - len / 2,
                  bottom: (y1 + y2) / 2 - 1.5,
                  width: len,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: stroke,
                  opacity: 0.6,
                  transform: [{ rotate: `${-angle}deg` }],
                }}
              />
            );
          })}
        {w > 0 &&
          points.map((_, i) => (
            <View key={`pt-${i}`} style={{ position: 'absolute', left: xs[i]! - 6, bottom: ys[i]! - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: stroke, borderWidth: 2, borderColor: theme.colors.surface }} />
          ))}
        <Text variant="caption" tone="subtle" style={{ position: 'absolute', left: 0, top: 0 }}>
          {`${max} ${unit}`}
        </Text>
        <Text variant="caption" tone="subtle" style={{ position: 'absolute', left: 0, bottom: 0 }}>
          {`${min} ${unit}`}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="subtle">
          {points[0]!.label}
        </Text>
        {points.length > 1 ? (
          <Text variant="caption" tone="subtle">
            {points[points.length - 1]!.label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Horizontal share bars (plants per category…). */
export function ShareBars({ rows }: { rows: { label: string; value: number }[] }) {
  const theme = useTheme();
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <View style={{ gap: 8 }}>
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 4 }} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySmall">{r.label}</Text>
            <Text variant="bodySmall" tone="muted">
              {r.value}
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ width: `${(r.value / total) * 100}%`, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
          </View>
        </View>
      ))}
    </View>
  );
}
