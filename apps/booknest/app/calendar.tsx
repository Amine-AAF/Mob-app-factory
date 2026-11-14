import { addDays, fromDayKey, toDayKey } from '@factory/app-core';
import { Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { IconAction, Page, Paper, Segmented, Serif } from '@/components/ui';
import { FREE_LIMITS } from '@/config/limits';
import { useData, usePremiumGate, useToday } from '@/hooks';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';
import type { CalendarDay } from '@/types';

function monthDays(month: string): (string | null)[] {
  const first = fromDayKey(`${month}-01`);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
}

const shiftMonth = (month: string, n: number) => {
  const d = fromDayKey(`${month}-01`);
  return toDayKey(new Date(d.getFullYear(), d.getMonth() + n, 1)).slice(0, 7);
};

function intensity(d: CalendarDay | undefined): number {
  if (!d) return 0;
  const minutes = d.seconds / 60;
  const score = minutes / 20 + d.pages / 30 + d.finished;
  return score <= 0 ? 0 : score < 0.75 ? 1 : score < 1.5 ? 2 : score < 3 ? 3 : 4;
}

export default function CalendarScreen() {
  const { t } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const premium = useIsPremium();
  const gate = usePremiumGate();
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string>(today);
  const year = month.slice(0, 4);
  const range = mode === 'month' ? { from: `${month}-01`, to: `${month}-31` } : { from: `${year}-01-01`, to: `${year}-12-31` };
  const { data } = useData(
    async (r) => {
      const [days, sessions, finished, started] = await Promise.all([r.reading.calendar(range.from, range.to), r.reading.sessions({ from: selected, to: selected }), r.reading.finishedOn(selected), r.reading.startedOn(selected)]);
      return { days: new Map(days.map((d) => [d.day, d])), sessions, finished, started };
    },
    [range.from, range.to, selected],
  );
  const shades = [theme.colors.surfaceAlt, theme.colors.accentSoft, '#E2BE7A', theme.colors.accent, theme.colors.primary];
  const minMonth = premium ? null : addDays(today, -FREE_LIMITS.historyDays).slice(0, 7);
  const canGoBack = !minMonth || shiftMonth(month, -1) >= minMonth;

  const busiest = useMemo(() => {
    const list = [...(data?.days.values() ?? [])].sort((a, b) => b.seconds - a.seconds);
    return list[0] && list[0].seconds > 0 ? list[0] : null;
  }, [data]);

  const DayCell = ({ day, size }: { day: string | null; size: number }) => {
    if (!day) return <View style={{ width: size, height: size }} />;
    const d = data?.days.get(day);
    const level = intensity(d);
    const future = day > today;
    return (
      <Pressable
        onPress={() => !future && setSelected(day)}
        disabled={future}
        accessibilityRole="button"
        accessibilityState={{ selected: selected === day, disabled: future }}
        accessibilityLabel={`${fmt.longDay(day)}${d ? `, ${t('calendar.dayA11y', { time: fmt.duration(d.seconds), pages: d.pages })}` : ''}`}
        testID={`cal-${day}`}
        style={{ width: size, height: size, borderRadius: size / 4, backgroundColor: shades[level], alignItems: 'center', justifyContent: 'center', borderWidth: selected === day ? 2 : day === today ? 1 : 0, borderColor: selected === day ? theme.colors.text : theme.colors.primary, opacity: future ? 0.35 : 1 }}
      >
        {size > 20 ? (
          <Text variant="caption" style={{ color: level >= 3 ? '#fff' : theme.colors.text, fontWeight: day === today ? '800' : '500' }}>
            {Number(day.slice(8))}
          </Text>
        ) : null}
        {size > 20 && d?.finished ? <View style={{ position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.success }} /> : null}
      </Pressable>
    );
  };

  return (
    <Page edges={['bottom']}>
      <Segmented value={mode} onChange={(m) => (m === 'year' && !gate('full_history') ? undefined : setMode(m))} options={[{ value: 'month', label: t('calendar.month') }, { value: 'year', label: t('calendar.year') }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconAction icon="chevron-back" label={t('calendar.previous')} onPress={() => (mode === 'month' ? (canGoBack ? setMonth(shiftMonth(month, -1)) : gate('full_history')) : setMonth(shiftMonth(month, -12)))} />
        <Serif size={20}>{mode === 'month' ? fmt.month(month) : year}</Serif>
        <IconAction icon="chevron-forward" label={t('calendar.next')} onPress={() => setMonth(shiftMonth(month, mode === 'month' ? 1 : 12) > today.slice(0, 7) ? month : shiftMonth(month, mode === 'month' ? 1 : 12))} />
      </View>

      {mode === 'month' ? (
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <Text key={d} variant="caption" tone="subtle" style={{ width: 40, textAlign: 'center' }}>
                {fmt.weekdayNarrow(d)}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 6 }}>
            {monthDays(month).map((d, i) => (
              <DayCell key={d ?? `e${i}`} day={d} size={40} />
            ))}
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
          {Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`).map((m) => (
            <Pressable key={m} onPress={() => (setMonth(m), setMode('month'))} accessibilityRole="button" accessibilityLabel={fmt.month(m)} style={{ width: '29%', gap: 4 }}>
              <Text variant="caption" tone="muted" style={{ fontWeight: '700' }}>
                {fmt.month(m).split(' ')[0]}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
                {monthDays(m).map((d, j) => (
                  <DayCell key={d ?? `e${j}`} day={d} size={11} />
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' }}>
        <Text variant="caption" tone="subtle">
          {t('calendar.less')}
        </Text>
        {shades.map((c) => (
          <View key={c} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c }} />
        ))}
        <Text variant="caption" tone="subtle">
          {t('calendar.more')}
        </Text>
      </View>

      {busiest ? (
        <Text variant="caption" tone="muted">
          {t('calendar.busiest', { date: fmt.longDay(busiest.day), time: fmt.duration(busiest.seconds) })}
        </Text>
      ) : null}

      <Paper>
        <Serif size={18}>{fmt.longDay(selected)}</Serif>
        {data?.sessions.length || data?.finished.length || data?.started.length ? (
          <>
            {data.sessions.map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/book/${s.bookId}`)} accessibilityRole="button">
                <Text variant="bodySmall">{`${fmt.time(s.startedAt)} · ${s.bookTitle} · ${fmt.duration(s.durationSec)}`}</Text>
              </Pressable>
            ))}
            {data.started.map((b) => (
              <Text key={`s${b.id}`} variant="bodySmall" tone="primary">
                {t('calendar.started', { title: b.title })}
              </Text>
            ))}
            {data.finished.map((b) => (
              <Text key={`f${b.id}`} variant="bodySmall" tone="success">
                {t('calendar.finished', { title: b.title })}
              </Text>
            ))}
          </>
        ) : (
          <Text variant="bodySmall" tone="subtle">
            {t('calendar.restDay')}
          </Text>
        )}
      </Paper>
    </Page>
  );
}
