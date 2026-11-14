import { IconButton, Row, Text, useTheme } from '@factory/design-system';
import { fromDayKey } from '@factory/app-core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { monthGrid } from '@/domain/schedule';
import type { DayKey } from '@/domain/types';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

/** Monday-first month grid. `marks` adds small dots (e.g. number of tasks that day). */
export function MonthCalendar({
  initial,
  selected,
  onSelect,
  marks,
  isDisabled,
  onMonthChange,
}: {
  initial: DayKey;
  selected: DayKey | null;
  onSelect: (d: DayKey) => void;
  marks?: Record<DayKey, { count: number; overdue?: boolean }>;
  isDisabled?: (d: DayKey) => boolean;
  onMonthChange?: (year: number, monthIndex: number) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const start = fromDayKey(initial);
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const grid = useMemo(() => monthGrid(ym.y, ym.m), [ym]);
  const today = clock.today();
  const move = (delta: number) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
    onMonthChange?.(d.getFullYear(), d.getMonth());
  };
  const prefix = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}`;

  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton icon="chevron-back" label={t('calendar.previousMonth')} onPress={() => move(-1)} />
        <Text variant="subheading" style={{ textTransform: 'capitalize' }} accessibilityRole="header">
          {fmt.month(ym.y, ym.m)}
        </Text>
        <IconButton icon="chevron-forward" label={t('calendar.nextMonth')} onPress={() => move(1)} />
      </Row>
      <View style={{ flexDirection: 'row' }}>
        {grid.slice(0, 7).map((d) => (
          <Text key={d} variant="caption" tone="subtle" center style={{ flex: 1 }}>
            {fmt.narrowWeekday(d)}
          </Text>
        ))}
      </View>
      {[0, 1, 2, 3, 4, 5].map((week) => (
        <View key={week} style={{ flexDirection: 'row' }}>
          {grid.slice(week * 7, week * 7 + 7).map((d) => {
            const inMonth = d.startsWith(prefix);
            const disabled = isDisabled?.(d) ?? false;
            const isSel = d === selected;
            const mark = marks?.[d];
            return (
              <Pressable
                key={d}
                disabled={disabled}
                onPress={() => onSelect(d)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSel, disabled }}
                accessibilityLabel={`${fmt.day(d, { dateStyle: 'full' })}${mark ? `, ${t('calendar.tasksCount', { count: mark.count })}` : ''}`}
                style={{ flex: 1, alignItems: 'center', paddingVertical: 4, opacity: disabled ? 0.3 : 1 }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSel ? theme.colors.primary : d === today ? theme.colors.primarySoft : 'transparent',
                  }}
                >
                  <Text variant="bodySmall" tone={isSel ? 'onPrimary' : inMonth ? 'default' : 'subtle'} style={{ fontWeight: d === today ? '800' : '500' }}>
                    {Number(d.slice(8))}
                  </Text>
                </View>
                <View style={{ height: 6, flexDirection: 'row', gap: 2, marginTop: 1 }}>
                  {mark
                    ? Array.from({ length: Math.min(3, mark.count) }, (_, i) => (
                        <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: mark.overdue ? theme.colors.danger : theme.colors.accent }} />
                      ))
                    : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
