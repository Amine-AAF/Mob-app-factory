import { View } from 'react-native';

import { Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/** Simple vertical bar chart (e.g. 12 months) built from plain Views; each bar has its own accessible label. */
export function MiniBarChart({ values, labels, a11yLabels, highlight, height = 120 }: { values: readonly number[]; labels: readonly string[]; a11yLabels: readonly string[]; highlight?: number; height?: number }) {
  const theme = useTheme();
  const max = Math.max(0, ...values);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing(1), height: height + 22 }}>
      {values.map((v, i) => {
        const h = max > 0 ? Math.max(v > 0 ? 3 : 1, (v / max) * height) : 1;
        return (
          <Stack key={i} gap={1} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }} accessible accessibilityLabel={a11yLabels[i]}>
            <View style={{ width: '100%', height: h, borderRadius: 3, backgroundColor: i === highlight ? theme.colors.primary : v > 0 ? theme.colors.accent : theme.colors.surfaceAlt }} />
            <Text variant="caption" tone={i === highlight ? 'default' : 'subtle'} numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {labels[i]}
            </Text>
          </Stack>
        );
      })}
    </View>
  );
}
