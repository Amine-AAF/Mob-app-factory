import { useTheme } from '@factory/design-system';
import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Segmented circular progress (no SVG dependency): `segments` small bars arranged
 * in a circle, filled clockwise from the top. Reads as a calm "dial" and stays
 * crisp at any size.
 */
export function ProgressRing({
  progress,
  size = 132,
  thickness = 10,
  segments = 48,
  color,
  children,
  accessibilityLabel,
}: {
  progress: number;
  size?: number;
  thickness?: number;
  segments?: number;
  color?: string;
  children?: ReactNode;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const filled = Math.round(p * segments);
  const barWidth = Math.max(3, ((Math.PI * size) / segments) * 0.55);
  const fill = color ?? theme.colors.primary;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
    >
      {Array.from({ length: segments }, (_, i) => (
        <View key={i} style={{ position: 'absolute', width: size, height: size, alignItems: 'center', transform: [{ rotate: `${(360 / segments) * i}deg` }] }}>
          <View style={{ width: barWidth, height: thickness, borderRadius: barWidth / 2, backgroundColor: i < filled ? fill : theme.colors.surfaceAlt }} />
        </View>
      ))}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}
