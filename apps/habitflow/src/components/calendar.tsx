import { addDays, fromDayKey, startOfWeek, type DayKey } from '@factory/app-core';
import { Text, useTheme } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { daysBetween, endOfMonth, startOfMonth } from '@/features/habits/schedule';
import type { DayState } from '@/features/tracking/progress';
import { fmt } from '@/i18n';

export interface CalendarDay {
  day: DayKey;
  state: DayState;
  ratio: number;
}

function useStateColors() {
  const theme = useTheme();
  return (state: DayState, ratio: number) => {
    switch (state) {
      case 'complete':
        return { bg: theme.colors.success, fg: '#FFFFFF' };
      case 'partial':
        return { bg: ratio >= 0.5 ? theme.colors.primary : theme.colors.primarySoft, fg: ratio >= 0.5 ? theme.colors.onPrimary : theme.colors.text };
      case 'missed':
        return { bg: theme.colors.dangerSoft, fg: theme.colors.danger };
      case 'pending':
        return { bg: theme.colors.surface, fg: theme.colors.text };
      default:
        return { bg: 'transparent', fg: theme.colors.textMuted };
    }
  };
}

function useStateLabel() {
  const { t } = useTranslation();
  return (state: DayState) => t(`calendar.state.${state}`);
}

/** 7-day strip (Monday first) with progress colors; tap a day to select it. */
export function WeeklyCalendar({ days, selected, today, onSelect }: { days: CalendarDay[]; selected: DayKey; today: DayKey; onSelect: (d: DayKey) => void }) {
  const theme = useTheme();
  const colors = useStateColors();
  const label = useStateLabel();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessibilityRole="tablist">
      {days.map((d) => {
        const date = fromDayKey(d.day);
        const c = colors(d.state, d.ratio);
        const isSel = d.day === selected;
        const future = d.day > today;
        return (
          <Pressable
            key={d.day}
            onPress={() => !future && onSelect(d.day)}
            disabled={future}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSel, disabled: future }}
            accessibilityLabel={`${fmt.longDay(date)}, ${label(d.state)}`}
            style={{ alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4, borderRadius: theme.radius.md, backgroundColor: isSel ? theme.colors.primarySoft : 'transparent', minWidth: 42 }}
          >
            <Text variant="caption" tone={isSel ? 'primary' : 'muted'}>
              {fmt.weekdayShort(date)}
            </Text>
            <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, borderWidth: d.day === today ? 2 : 0, borderColor: theme.colors.primary, opacity: future ? 0.4 : 1 }}>
              <Text variant="bodySmall" style={{ color: c.fg, fontWeight: '700' }}>
                {String(date.getDate())}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Weekday headers for a Monday-first grid, localized. */
function useWeekdayHeaders(): string[] {
  const monday = '2026-11-02';
  return Array.from({ length: 7 }, (_, i) => fmt.weekdayNarrow(fromDayKey(addDays(monday, i))));
}

/** Month grid; days outside the month are blank, future days are disabled. */
export function MonthCalendar({ month, days, today, selected, onSelect }: { month: DayKey; days: Map<DayKey, CalendarDay>; today: DayKey; selected: DayKey | null; onSelect: (d: DayKey) => void }) {
  const theme = useTheme();
  const colors = useStateColors();
  const label = useStateLabel();
  const headers = useWeekdayHeaders();
  const first = startOfMonth(month);
  const gridStart = startOfWeek(first);
  const last = endOfMonth(month);
  const cells = daysBetween(gridStart, addDays(startOfWeek(last), 6));
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row' }}>
        {headers.map((h, i) => (
          <Text key={i} variant="caption" tone="subtle" center style={{ flex: 1 }}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row) => (
        <View key={row[0]} style={{ flexDirection: 'row' }}>
          {row.map((day) => {
            const inMonth = day >= first && day <= last;
            if (!inMonth) return <View key={day} style={{ flex: 1, aspectRatio: 1 }} />;
            const info = days.get(day) ?? { day, state: 'none' as DayState, ratio: 0 };
            const c = colors(info.state, info.ratio);
            const future = day > today;
            const isSel = day === selected;
            return (
              <Pressable
                key={day}
                disabled={future}
                onPress={() => onSelect(day)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel, disabled: future }}
                accessibilityLabel={`${fmt.longDay(fromDayKey(day))}, ${label(info.state)}`}
                testID={`cal-${day}`}
                style={{ flex: 1, aspectRatio: 1, padding: 3 }}
              >
                <View style={{ flex: 1, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, borderWidth: isSel ? 2 : day === today ? 1 : 0, borderColor: isSel ? theme.colors.text : theme.colors.primary, opacity: future ? 0.35 : 1 }}>
                  <Text variant="bodySmall" style={{ color: c.fg, fontWeight: day === today ? '800' : '600' }}>
                    {String(fromDayKey(day).getDate())}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function CalendarLegend() {
  const { t } = useTranslation();
  const colors = useStateColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {(['complete', 'partial', 'missed'] as const).map((s) => (
        <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: colors(s, 0.6).bg }} />
          <Text variant="caption" tone="muted">
            {t(`calendar.state.${s}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
