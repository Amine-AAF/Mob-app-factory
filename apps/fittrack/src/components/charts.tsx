import { Card, Icon, Text, useTheme, type IconName } from '@factory/design-system';
import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

/**
 * Lightweight, dependency-free charts drawn with Views. Every chart carries an
 * accessibility summary. `null` values are gaps (no data), never zeros.
 */
export function BarChart({ data, height = 120, color, summary, valueLabel }: { data: { label: string; value: number | null; highlight?: boolean }[]; height?: number; color?: string; summary: string; valueLabel?: (v: number) => string }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value ?? 0));
  const c = color ?? theme.colors.primary;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: height + 38 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {d.value ? (valueLabel ? valueLabel(d.value) : String(Math.round(d.value))) : ' '}
          </Text>
          <View style={{ width: '100%', height, justifyContent: 'flex-end', borderRadius: 6, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            {d.value ? <View style={{ height: Math.max(3, (d.value / max) * height), backgroundColor: d.highlight ? c : `${c}AA`, borderRadius: 6 }} /> : null}
          </View>
          <Text variant="caption" tone={d.highlight ? 'primary' : 'subtle'} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Line chart for progressions (weight over time, 1RM estimate, body weight…). */
export function LineChart({ points, height = 140, color, summary, formatValue, dashed }: { points: { label: string; value: number }[]; height?: number; color?: string; summary: string; formatValue: (v: number) => string; dashed?: boolean }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const c = color ?? theme.colors.primary;
  if (points.length === 0) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(1, Math.abs(max) * 0.1);
  const pad = 10;
  const xy = (i: number, v: number) => ({
    x: points.length === 1 ? width / 2 : pad + (i / (points.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - (min - (max === min ? span / 2 : 0))) / span) * (height - pad * 2),
  });
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="subtle">
          {formatValue(max)}
        </Text>
        <Text variant="caption" tone="subtle">
          {formatValue(min)}
        </Text>
      </View>
      <View onLayout={onLayout} style={{ height, borderRadius: 12, backgroundColor: theme.colors.surfaceAlt }}>
        {width > 0
          ? points.map((p, i) => {
              const a = xy(i, p.value);
              const next = points[i + 1];
              const b = next ? xy(i + 1, next.value) : null;
              const len = b ? Math.hypot(b.x - a.x, b.y - a.y) : 0;
              const angle = b ? Math.atan2(b.y - a.y, b.x - a.x) : 0;
              return (
                <View key={i} pointerEvents="none">
                  {b ? (
                    <View
                      style={{
                        position: 'absolute', left: (a.x + b.x) / 2 - len / 2, top: (a.y + b.y) / 2 - 1.5, width: len, height: 3, borderRadius: 2,
                        backgroundColor: c, opacity: dashed ? 0.55 : 1, transform: [{ rotate: `${angle}rad` }],
                      }}
                    />
                  ) : null}
                  <View style={{ position: 'absolute', left: a.x - 4, top: a.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: c }} />
                </View>
              );
            })
          : null}
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

/** Horizontal proportion bars (muscle-group distribution). */
export function DistributionBars({ rows, summary }: { rows: { label: string; ratio: number; value: string }[]; summary: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel={summary} style={{ gap: 10 }}>
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="bodySmall">{r.label}</Text>
            <Text variant="bodySmall" tone="muted">
              {r.value}
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            <View style={{ height: 8, width: `${Math.max(2, Math.round(r.ratio * 100))}%`, backgroundColor: theme.colors.primary, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Card with an icon, a big value and a caption. */
export function MetricCard({ icon, value, label, tone = 'primary', children, onPress }: { icon: IconName; value: string; label: string; tone?: 'primary' | 'accent' | 'success' | 'warning'; children?: ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  const color = theme.colors[tone];
  return (
    <Card style={{ flex: 1, minWidth: 140, gap: 6 }} accessibilityLabel={`${label}: ${value}`} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={18} color={color} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text variant="title">{value}</Text>
      {children}
    </Card>
  );
}

/** Ring progress (goals, workout completion) drawn as a circle of segments — the FitTrack "dial". */
export function ProgressRing({ ratio, size = 64, stroke = 6, segments = 30, label, color, children }: { ratio: number; size?: number; stroke?: number; segments?: number; label: string; color?: string; children?: ReactNode }) {
  const theme = useTheme();
  const r = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  const filled = Math.round(r * segments);
  const c = color ?? theme.colors.primary;
  const radius = size / 2 - stroke / 2;
  const segLen = Math.max(2, ((2 * Math.PI * radius) / segments) * 0.62);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(r * 100) }} style={{ width: size, height: size }}>
      {Array.from({ length: segments }, (_, i) => {
        const a = (i / segments) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + radius * Math.cos(a);
        const y = size / 2 + radius * Math.sin(a);
        return (
          <View
            key={i}
            style={{
              position: 'absolute', left: x - stroke / 2, top: y - segLen / 2, width: stroke, height: segLen, borderRadius: stroke / 2,
              backgroundColor: i < filled ? c : theme.colors.surfaceAlt, transform: [{ rotate: `${a + Math.PI / 2}rad` }],
            }}
          />
        );
      })}
      <View style={{ position: 'absolute', left: 0, top: 0, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
