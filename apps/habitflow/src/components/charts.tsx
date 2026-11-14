import { Card, Icon, Text, useTheme, type IconName } from '@factory/design-system';
import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Simple accessible bar chart (values in [0, 1] or null = no data). */
export function BarChart({ data, height = 120, color, summary }: { data: { label: string; value: number | null; highlight?: boolean }[]; height?: number; color?: string; summary: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: height + 22 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <View style={{ width: '100%', height, justifyContent: 'flex-end', borderRadius: 6, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
            {d.value !== null ? <View style={{ height: Math.max(3, Math.min(1, d.value) * height), backgroundColor: d.highlight ? (color ?? theme.colors.primary) : `${color ?? theme.colors.primary}99`, borderRadius: 6 }} /> : null}
          </View>
          <Text variant="caption" tone={d.highlight ? 'primary' : 'subtle'} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Card with an icon, a big value and a caption. */
export function StatisticsCard({ icon, value, label, tone = 'primary', children }: { icon: IconName; value: string; label: string; tone?: 'primary' | 'accent' | 'success' | 'warning'; children?: ReactNode }) {
  const theme = useTheme();
  const color = theme.colors[tone];
  return (
    <Card style={{ flex: 1, minWidth: 140, gap: 6 }} accessibilityLabel={`${label}: ${value}`}>
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
