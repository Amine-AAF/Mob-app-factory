import { IconButton, Row, Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { addDays, addMonths, fromDayKey, toDayKey, type DayKey } from '@/domain/dates';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

/**
 * Month grid (Monday first). `marks` adds coloured dots under days (due tasks).
 * Pure JS: no native date picker dependency, works the same on every Android version.
 */
export function MonthCalendar({ month, onMonthChange, selected, onSelect, marks }: { month: string; onMonthChange: (m: string) => void; selected: DayKey | null; onSelect: (d: DayKey) => void; marks?: Record<DayKey, string[]> }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const today = toDayKey(clock.now());
  const first = `${month}-01`;
  const offset = (fromDayKey(first).getDay() + 6) % 7; // Monday = 0
  const start = addDays(first, -offset);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)).filter((week) => week.some((d) => d.startsWith(month)));
  const headers = days.slice(0, 7).map((d) => fmt.weekdayNarrow(fromDayKey(d)));

  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('calendar.previous')} onPress={() => onMonthChange(addMonths(first, -1).slice(0, 7))} />
        <Text variant="subheading" accessibilityRole="header" style={{ textTransform: 'capitalize' }}>
          {fmt.monthTitle(month)}
        </Text>
        <IconButton icon="chevron-forward" label={t('calendar.next')} onPress={() => onMonthChange(addMonths(first, 1).slice(0, 7))} />
      </Row>
      <View style={{ flexDirection: 'row' }}>
        {headers.map((h, i) => (
          <Text key={i} variant="caption" tone="subtle" center style={{ flex: 1 }}>
            {h}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0]} style={{ flexDirection: 'row' }}>
          {week.map((d) => {
            const inMonth = d.startsWith(month);
            const isSel = d === selected;
            const isToday = d === today;
            const dots = marks?.[d] ?? [];
            return (
              <Pressable
                key={d}
                onPress={() => onSelect(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel }}
                accessibilityLabel={`${fmt.day(d, 'long')}${dots.length ? `, ${t('calendar.itemsCount', { count: dots.length })}` : ''}`}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSel ? theme.colors.primary : 'transparent',
                    borderWidth: isToday && !isSel ? 1.5 : 0,
                    borderColor: theme.colors.primary,
                  }}
                >
                  <Text variant="bodySmall" style={{ color: isSel ? theme.colors.onPrimary : inMonth ? theme.colors.text : theme.colors.textSubtle, fontWeight: isToday ? '800' : '500' }}>
                    {Number(d.slice(8))}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, height: 6, marginTop: 1 }}>
                  {dots.slice(0, 3).map((c, i) => (
                    <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c }} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
