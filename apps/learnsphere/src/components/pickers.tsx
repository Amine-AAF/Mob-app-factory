import { addDays, type DayKey } from '@factory/app-core';
import { Chip, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { monthGrid, shiftView } from '@/features/planner/planner';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';

import { Stepper } from './ui';

/** Horizontal chips to pick a subject (or none). */
export function SubjectPicker({ subjects, value, onChange, allowNone = true, label }: { subjects: { id: string; name: string }[]; value: string | null; onChange: (id: string | null) => void; allowNone?: boolean; label?: string }) {
  const { t } = useTranslation();
  return (
    <Stack gap={2}>
      {label ? (
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {label}
        </Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {allowNone ? <Chip label={t('common.noSubject')} selected={value === null} onPress={() => onChange(null)} /> : null}
        {subjects.map((s) => (
          <Chip key={s.id} label={s.name} selected={value === s.id} onPress={() => onChange(s.id)} />
        ))}
      </ScrollView>
    </Stack>
  );
}

/** Compact month calendar used to pick a day (no native dependency). */
export function DayField({ label, value, onChange, allowClear, testID }: { label: string; value: DayKey | null; onChange: (d: DayKey | null) => void; allowClear?: boolean; testID?: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<DayKey>(value ?? clock.today());
  const today = clock.today();
  const grid = monthGrid(cursor);
  const weekLabels = grid.slice(0, 7).map((g) => fmt.weekdayNarrow(g.day));
  return (
    <Stack gap={2}>
      <Text variant="bodySmall" style={{ fontWeight: '600' }}>
        {label}
      </Text>
      <Row gap={2}>
        <Pressable
          testID={testID}
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? fmt.dayLong(value) : t('common.none')}`}
          style={{ flex: 1, minHeight: 48, borderRadius: theme.radius.md, borderWidth: 1.5, borderColor: open ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.surface, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Icon name="calendar-outline" size={18} color={theme.colors.textMuted} />
          <Text style={{ flex: 1 }}>{value ? fmt.dayLong(value) : t('common.none')}</Text>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textMuted} />
        </Pressable>
        {allowClear && value ? (
          <Pressable onPress={() => onChange(null)} accessibilityRole="button" accessibilityLabel={t('common.clear')} hitSlop={8}>
            <Icon name="close-circle" size={22} color={theme.colors.textSubtle} />
          </Pressable>
        ) : null}
      </Row>
      {open ? (
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Pressable onPress={() => setCursor(shiftView(cursor, 'month', -1))} accessibilityRole="button" accessibilityLabel={t('planner.previous')} hitSlop={8} style={{ padding: 8 }}>
              <Icon name="chevron-back" size={20} color={theme.colors.text} />
            </Pressable>
            <Text variant="subheading">{fmt.monthYear(cursor)}</Text>
            <Pressable onPress={() => setCursor(shiftView(cursor, 'month', 1))} accessibilityRole="button" accessibilityLabel={t('planner.next')} hitSlop={8} style={{ padding: 8 }}>
              <Icon name="chevron-forward" size={20} color={theme.colors.text} />
            </Pressable>
          </Row>
          <Row gap={0}>
            {weekLabels.map((w, i) => (
              <Text key={i} variant="caption" tone="subtle" center style={{ flex: 1 }}>
                {w}
              </Text>
            ))}
          </Row>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {grid.map((g) => {
              const selected = g.day === value;
              return (
                <Pressable
                  key={g.day}
                  onPress={() => {
                    onChange(g.day);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={fmt.dayLong(g.day)}
                  style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.colors.primary : 'transparent', borderWidth: g.day === today ? 1 : 0, borderColor: theme.colors.primary }}>
                    <Text variant="bodySmall" style={{ color: selected ? theme.colors.onPrimary : g.inMonth ? theme.colors.text : theme.colors.textSubtle }}>
                      {Number(g.day.slice(8))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Row gap={2} wrap style={{ paddingTop: 4 }}>
            <Chip label={t('common.today')} selected={value === today} onPress={() => (onChange(today), setOpen(false))} />
            <Chip label={t('common.tomorrow')} selected={value === addDays(today, 1)} onPress={() => (onChange(addDays(today, 1)), setOpen(false))} />
            <Chip label={t('common.inAWeek')} selected={value === addDays(today, 7)} onPress={() => (onChange(addDays(today, 7)), setOpen(false))} />
          </Row>
        </View>
      ) : null}
    </Stack>
  );
}

/** Time of day in 5-minute steps. */
export function TimeField({ label, value, onChange }: { label: string; value: number; onChange: (minuteOfDay: number) => void }) {
  return <Stepper label={label} value={value} onChange={onChange} min={0} max={23 * 60 + 55} step={15} format={fmt.time} />;
}
