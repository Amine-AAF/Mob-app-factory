import { memo } from 'react';
import { View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import type { DayKey, WardrobeItem } from '@/domain/types';
import { useLabels } from '@/hooks/useLabels';
import { PressableScale, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

/** Month-grid cell: day number, thumbnail of the first planned outfit (or a dot), today ring. */
export const DayCell = memo(function DayCell({
  day,
  inMonth,
  isToday,
  planCount,
  cover,
  label,
  onPress,
}: {
  day: DayKey;
  inMonth: boolean;
  isToday: boolean;
  planCount: number;
  cover: WardrobeItem | null;
  label: string;
  onPress: (day: DayKey) => void;
}) {
  const theme = useTheme();
  const labels = useLabels();
  return (
    <PressableScale
      onPress={() => onPress(day)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: `${100 / 7}%`, padding: 2 }}
    >
      <View
        style={{
          minHeight: 72,
          borderRadius: theme.radius.sm,
          paddingVertical: 4,
          alignItems: 'center',
          gap: 3,
          backgroundColor: isToday ? theme.colors.accentSoft : 'transparent',
          borderWidth: isToday ? 1 : 0,
          borderColor: theme.colors.accent,
          opacity: inMonth ? 1 : 0.4,
        }}
      >
        <Text variant="caption" style={{ fontWeight: isToday ? '700' : '500' }}>
          {Number(day.slice(8))}
        </Text>
        {cover ? (
          <View style={{ width: '78%' }}>
            <ItemPhoto photoPath={cover.photoPath} thumbPath={cover.thumbPath} categoryKey={labels.categoryKey(cover.categoryId)} color={cover.primaryColor} rounded />
          </View>
        ) : planCount > 0 ? (
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 6 }} />
        ) : null}
        {planCount > 1 ? (
          <Text variant="caption" tone="subtle" style={{ fontSize: 10, lineHeight: 12 }}>
            {`+${planCount - 1}`}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
});
