import { View } from 'react-native';

import { ColorDot, Row, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

export interface BarEntry {
  key: string;
  label: string;
  value: number;
  /** Formatted value shown on the right (defaults to the number). */
  display?: string;
  /** Optional swatch (colors). */
  swatch?: string;
}

/** Horizontal bars, relative to the largest value. Plain Views, one accessible line per entry. */
export function BarList({ entries, max }: { entries: readonly BarEntry[]; max?: number }) {
  const theme = useTheme();
  const top = max ?? Math.max(1, ...entries.map((e) => e.value));
  return (
    <Stack gap={2.5}>
      {entries.map((e) => {
        const display = e.display ?? String(e.value);
        return (
          <View key={e.key} accessible accessibilityLabel={`${e.label}: ${display}`} style={{ gap: theme.spacing(1) }}>
            <Row gap={2}>
              {e.swatch ? <ColorDot hex={e.swatch} size={12} /> : null}
              <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                {e.label}
              </Text>
              <Text variant="bodySmall" tone="muted">
                {display}
              </Text>
            </Row>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.surfaceAlt, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(2, Math.min(100, (e.value / top) * 100))}%`, height: '100%', borderRadius: 3, backgroundColor: e.swatch ?? theme.colors.primary }} />
            </View>
          </View>
        );
      })}
    </Stack>
  );
}
