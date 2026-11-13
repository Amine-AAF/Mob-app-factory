import { Button, IconButton, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, View } from 'react-native';

import { currentLanguage, fmt } from '@/i18n';
import type { LocalDate } from '@/types/models';
import { clock } from '@/utils/clock';
import { addDays, isValidDate } from '@/utils/dates';

/** Cells of a month grid (null = padding), weeks starting on Monday (fr/es) or Sunday (en). */
export function monthGrid(year: number, month: number, weekStartsOn: 0 | 1): (LocalDate | null)[] {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const weekday = new Date(`${first}T12:00:00Z`).getUTCDay();
  const pad = (weekday - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (LocalDate | null)[] = Array.from({ length: pad }, () => null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i));
  while (cells.length % 7) cells.push(null);
  return cells;
}

const weekStart = (): 0 | 1 => (currentLanguage() === 'en' ? 0 : 1);

/**
 * Calendar date picker in pure JS (no native dependency): returns a calendar date
 * string, never a time-zoned instant.
 */
export function DateField({
  label,
  value,
  onChange,
  min,
  max,
  optional,
  error,
  testID,
}: {
  label: string;
  value: LocalDate | null;
  onChange: (value: LocalDate | null) => void;
  min?: LocalDate | null;
  max?: LocalDate | null;
  optional?: boolean;
  error?: string | null;
  testID?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const initial = value ?? min ?? clock.today();
  const [cursor, setCursor] = useState({ y: Number(initial.slice(0, 4)), m: Number(initial.slice(5, 7)) });
  const ws = weekStart();
  const cells = monthGrid(cursor.y, cursor.m, ws);
  const weekdays = Array.from({ length: 7 }, (_, i) => fmt.date(addDays('2026-01-04', i + ws), { weekday: 'narrow' }));
  const shift = (delta: number) => setCursor((c) => {
    const m = c.m + delta;
    return m < 1 ? { y: c.y - 1, m: 12 } : m > 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m };
  });
  const disabled = (d: LocalDate) => (min && isValidDate(min) && d < min) || (max && isValidDate(max) && d > max);

  return (
    <Stack gap={1.5}>
      <Text variant="label">{label}</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? fmt.date(value) : t('dateField.none')}`}
        onPress={() => {
          const base = value ?? min ?? clock.today();
          setCursor({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) });
          setOpen(true);
        }}
        style={{
          minHeight: 48,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing(3.5),
          justifyContent: 'center',
        }}
      >
        <Text tone={value ? 'default' : 'subtle'}>{value ? fmt.date(value, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : t('dateField.choose')}</Text>
      </Pressable>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: theme.spacing(5) }}>
          <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing(4), gap: theme.spacing(3) }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <IconButton icon="chevron-back" label={t('dateField.previousMonth')} onPress={() => shift(-1)} />
              <Text variant="subheading" accessibilityRole="header">
                {fmt.date(`${cursor.y}-${String(cursor.m).padStart(2, '0')}-01`, { month: 'long', year: 'numeric' })}
              </Text>
              <IconButton icon="chevron-forward" label={t('dateField.nextMonth')} onPress={() => shift(1)} />
            </Row>
            <View style={{ flexDirection: 'row' }}>
              {weekdays.map((w, i) => (
                <Text key={i} variant="caption" tone="subtle" center style={{ flex: 1 }}>
                  {w}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((d, i) => {
                const selected = d === value;
                const off = d ? disabled(d) : true;
                return (
                  <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                    {d ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={fmt.date(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        accessibilityState={{ selected, disabled: !!off }}
                        disabled={!!off}
                        testID={testID ? `${testID}-day-${d}` : undefined}
                        onPress={() => {
                          onChange(d);
                          setOpen(false);
                        }}
                        style={{
                          flex: 1,
                          borderRadius: theme.radius.pill,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: selected ? theme.colors.primary : d === clock.today() ? theme.colors.primarySoft : 'transparent',
                          opacity: off ? 0.3 : 1,
                        }}
                      >
                        <Text variant="bodySmall" style={{ color: selected ? theme.colors.onPrimary : theme.colors.text, fontWeight: selected ? '700' : '400' }}>
                          {String(Number(d.slice(8)))}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
            <Row gap={2} style={{ justifyContent: 'flex-end' }}>
              {optional && value ? (
                <Button
                  label={t('dateField.clear')}
                  variant="ghost"
                  onPress={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                />
              ) : null}
              <Button label={t('common.cancel')} variant="secondary" onPress={() => setOpen(false)} />
            </Row>
          </View>
        </View>
      </Modal>
    </Stack>
  );
}
