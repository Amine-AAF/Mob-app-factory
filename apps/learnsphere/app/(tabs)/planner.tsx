import { addDays } from '@factory/app-core';
import { Button, EmptyState, Icon, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Fab, Segmented } from '@/components/ui';
import { repos } from '@/database';
import type { StudySession } from '@/database/repositories/planner';
import { missedSessions, monthGrid, shiftView, viewRange, weekDays, type PlannerView } from '@/features/planner/planner';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { afterLearningWrite } from '@/services/progress';

function SessionCard({ s, color, subjectName, missed }: { s: StudySession; color: string; subjectName?: string; missed: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const done = s.status === 'done';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/planner/session', params: { id: s.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${s.title}, ${fmt.time(s.startMinute)}, ${t(`planner.status.${missed ? 'missed' : s.status}`)}`}
      style={{ flexDirection: 'row', gap: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, opacity: s.status === 'skipped' ? 0.6 : 1 }}
    >
      <View style={{ width: 4, borderRadius: 2, backgroundColor: color }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontWeight: '600', textDecorationLine: done ? 'line-through' : 'none' }}>{s.title}</Text>
        <Text variant="caption" tone="subtle">
          {fmt.time(s.startMinute)} · {fmt.duration(s.durationMin)}
          {subjectName && subjectName !== s.title ? ` · ${subjectName}` : ''}
        </Text>
        {s.goal ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {s.goal}
          </Text>
        ) : null}
      </View>
      {done ? (
        <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
      ) : missed ? (
        <Text variant="caption" tone="warning" style={{ fontWeight: '700' }}>
          {t('planner.status.missed')}
        </Text>
      ) : s.status === 'skipped' ? (
        <Text variant="caption" tone="subtle">
          {t('planner.status.skipped')}
        </Text>
      ) : (
        <Pressable
          onPress={async () => {
            await repos().planner.completeSession(s.id);
            await afterLearningWrite(repos());
          }}
          accessibilityRole="button"
          accessibilityLabel={t('planner.markDone')}
          hitSlop={10}
        >
          <Icon name="ellipse-outline" size={24} color={theme.colors.textSubtle} />
        </Pressable>
      )}
    </Pressable>
  );
}

export default function Planner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [view, setView] = useState<PlannerView>('week');
  const [cursor, setCursor] = useState(clock.today());
  const today = clock.today();
  const range = viewRange(cursor, view);
  const { data } = useAsync(async () => {
    const [sessions, subjects, agenda] = await Promise.all([repos().planner.sessionsBetween(range.from, range.to), repos().subjects.list('all'), repos().agenda.list({ from: range.from })]);
    return { sessions, subjects, agenda: agenda.filter((a) => a.day <= range.to) };
  }, [range.from, range.to]);
  const subjectById = new Map((data?.subjects ?? []).map((s) => [s.id, s]));
  const missedIds = new Set(missedSessions(data?.sessions ?? [], clock.now()).map((s) => s.id));
  const byDay = (day: string) => (data?.sessions ?? []).filter((s) => s.day === day);
  const agendaByDay = (day: string) => (data?.agenda ?? []).filter((a) => a.day === day);

  const title = view === 'month' ? fmt.monthYear(cursor) : view === 'week' ? `${fmt.day(range.from, { day: 'numeric', month: 'short' })} – ${fmt.day(range.to, { day: 'numeric', month: 'short' })}` : fmt.dayLong(cursor);

  const dayList = (day: string) => {
    const sessions = byDay(day);
    const items = agendaByDay(day);
    return (
      <Stack gap={2} key={day}>
        <Row gap={2}>
          <Text variant="subheading" tone={day === today ? 'primary' : 'default'}>
            {fmt.day(day)}
          </Text>
          {day === today ? <Text variant="caption" tone="primary">{t('common.today')}</Text> : null}
          <View style={{ flex: 1 }} />
          <Text variant="caption" tone="subtle">
            {fmt.duration(sessions.filter((s) => s.status !== 'skipped').reduce((a, s) => a + s.durationMin, 0))}
          </Text>
        </Row>
        {items.map((a) => (
          <Pressable key={a.id} onPress={() => router.push({ pathname: '/agenda/[id]', params: { id: a.id, table: a.table } })} accessibilityRole="button">
            <Row gap={2} style={{ backgroundColor: theme.colors.dangerSoft, borderRadius: theme.radius.sm, padding: 8 }}>
              <Icon name="alarm" size={16} color={theme.colors.danger} />
              <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                {t(`agenda.kinds.${a.kind}`)} · {a.title}
              </Text>
            </Row>
          </Pressable>
        ))}
        {sessions.length === 0 && items.length === 0 ? (
          <Text variant="caption" tone="subtle">
            {t('planner.free')}
          </Text>
        ) : null}
        {sessions.map((s) => (
          <SessionCard key={s.id} s={s} color={(s.subjectId && subjectById.get(s.subjectId)?.color) || theme.colors.primary} subjectName={s.subjectId ? subjectById.get(s.subjectId)?.name : undefined} missed={missedIds.has(s.id)} />
        ))}
      </Stack>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen testID="planner-screen">
        <Row>
          <Text variant="title" accessibilityRole="header" style={{ flex: 1 }}>
            {t('planner.title')}
          </Text>
          <IconButton icon="time-outline" label={t('planner.history')} onPress={() => router.push('/planner/history')} />
          <IconButton icon="timer-outline" label={t('focus.title')} onPress={() => router.push('/focus')} />
        </Row>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'day', label: t('planner.views.day') },
            { value: 'week', label: t('planner.views.week') },
            { value: 'month', label: t('planner.views.month') },
          ]}
          testID="planner-view"
        />
        <Row>
          <IconButton icon="chevron-back" label={t('planner.previous')} onPress={() => setCursor(shiftView(cursor, view, -1))} />
          <Pressable style={{ flex: 1 }} onPress={() => setCursor(today)} accessibilityRole="button" accessibilityLabel={t('planner.backToToday')}>
            <Text variant="subheading" center>
              {title}
            </Text>
          </Pressable>
          <IconButton icon="chevron-forward" label={t('planner.next')} onPress={() => setCursor(shiftView(cursor, view, 1))} />
        </Row>

        {view === 'day' ? dayList(cursor) : null}
        {view === 'week' ? weekDays(cursor).map(dayList) : null}
        {view === 'month' ? (
          <>
            <View style={{ flexDirection: 'row' }}>
              {weekDays(cursor).map((d) => (
                <Text key={d} variant="caption" tone="subtle" center style={{ flex: 1 }}>
                  {fmt.weekdayShort(d)}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {monthGrid(cursor).map((g) => {
                const count = byDay(g.day).filter((s) => s.status !== 'skipped').length;
                const hasExam = agendaByDay(g.day).length > 0;
                return (
                  <Pressable
                    key={g.day}
                    onPress={() => (setCursor(g.day), setView('day'))}
                    accessibilityRole="button"
                    accessibilityLabel={`${fmt.dayLong(g.day)}, ${t('planner.sessionsCount', { count })}`}
                    style={{ width: `${100 / 7}%`, aspectRatio: 0.9, padding: 2 }}
                  >
                    <View style={{ flex: 1, borderRadius: 10, alignItems: 'center', paddingTop: 6, gap: 3, backgroundColor: g.day === today ? theme.colors.primarySoft : g.inMonth ? theme.colors.surface : 'transparent' }}>
                      <Text variant="bodySmall" tone={g.inMonth ? 'default' : 'subtle'} style={{ fontWeight: g.day === today ? '800' : '500' }}>
                        {Number(g.day.slice(8))}
                      </Text>
                      <Row gap={1}>
                        {count > 0 ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary }} /> : null}
                        {hasExam ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.danger }} /> : null}
                      </Row>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Row gap={3}>
              <Row gap={1}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
                <Text variant="caption" tone="subtle">
                  {t('planner.legendSessions')}
                </Text>
              </Row>
              <Row gap={1}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.danger }} />
                <Text variant="caption" tone="subtle">
                  {t('planner.legendExams')}
                </Text>
              </Row>
            </Row>
          </>
        ) : null}
        {data && data.subjects.length === 0 ? <EmptyState icon="calendar-outline" title={t('planner.emptyTitle')} message={t('planner.emptyBody')} action={<Button label={t('templates.browse')} variant="secondary" onPress={() => router.push('/templates')} />} /> : null}
        <View style={{ height: 72 }} />
      </Screen>
      <Fab label={t('planner.newSession')} onPress={() => router.push({ pathname: '/planner/session', params: { day: view === 'month' ? addDays(today, 0) : cursor } })} testID="new-session" />
    </View>
  );
}
