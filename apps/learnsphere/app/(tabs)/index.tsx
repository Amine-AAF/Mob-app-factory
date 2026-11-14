import { Button, EmptyState, Icon, IconButton, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AdBanner } from '@/components/AdBanner';
import { BarChart, Panel, Pill, ProgressRing, SubjectIcon } from '@/components/ui';
import { repos } from '@/database';
import { loadDashboard } from '@/features/dashboard';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { usePreferences, type DashboardCard } from '@/store/preferences';

export default function Home() {
  const { t } = useTranslation();
  const theme = useTheme();
  const name = usePreferences((s) => s.learnerName);
  const dailyMinutes = usePreferences((s) => s.dailyMinutes);
  const cards = usePreferences((s) => s.dashboardCards);
  const { data } = useAsync(() => loadDashboard(repos(), clock.now(), clock.today(), dailyMinutes), [dailyMinutes]);

  if (!data) return <Screen>{null}</Screen>;
  const subjectById = new Map(data.subjects.map((s) => [s.id, s]));
  const hour = clock.now().getHours();
  const greeting = t(hour < 12 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening', { name: name || t('home.learner') });

  const sections: Record<DashboardCard, React.ReactNode> = {
    today: (
      <Panel key="today" title={t('home.today')} icon="today">
        <Row gap={4}>
          <ProgressRing progress={data.todayMinutes / Math.max(1, data.dailyMinutes)} label={fmt.duration(data.todayMinutes)} sublabel={t('home.ofMinutes', { value: fmt.duration(data.dailyMinutes) })} size={96} />
          <Stack gap={2} style={{ flex: 1 }}>
            <Row gap={2}>
              <Icon name="flame" size={18} color={theme.colors.accent} />
              <Text variant="subheading">{t('home.streak', { count: data.streak.current })}</Text>
            </Row>
            <Text variant="bodySmall" tone="muted">
              {t('home.activeDays', { count: data.activeThisWeek })}
            </Text>
            <Button size="md" label={t('focus.start')} icon="timer-outline" onPress={() => router.push('/focus')} testID="home-focus" />
          </Stack>
        </Row>
        {data.sessionsToday.length ? (
          <Stack gap={2}>
            <Text variant="label" tone="subtle">
              {t('home.plannedToday')}
            </Text>
            {data.sessionsToday.map((s) => {
              const subject = s.subjectId ? subjectById.get(s.subjectId) : undefined;
              return (
                <Pressable key={s.id} onPress={() => router.push({ pathname: '/planner/session', params: { id: s.id } })} accessibilityRole="button" accessibilityLabel={`${s.title} ${fmt.time(s.startMinute)}`}>
                  <Row gap={3} style={{ paddingVertical: 4 }}>
                    <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: subject?.color ?? theme.colors.primary }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ textDecorationLine: s.status === 'done' ? 'line-through' : 'none' }}>{s.title}</Text>
                      <Text variant="caption" tone="subtle">
                        {fmt.time(s.startMinute)} · {fmt.duration(s.durationMin)}
                      </Text>
                    </View>
                    {s.status === 'done' ? <Icon name="checkmark-circle" size={22} color={theme.colors.success} /> : null}
                  </Row>
                </Pressable>
              );
            })}
          </Stack>
        ) : (
          <Text variant="bodySmall" tone="muted">
            {t('home.nothingPlanned')}
          </Text>
        )}
      </Panel>
    ),
    suggestions: data.suggestions.length ? (
      <Panel key="suggestions" title={t('suggestions.title')} icon="bulb-outline">
        <Text variant="caption" tone="subtle">
          {t('suggestions.basis')}
        </Text>
        {data.suggestions.map((s, i) => {
          const subject = s.subjectId ? subjectById.get(s.subjectId) : undefined;
          return (
            <Row key={i} gap={3}>
              <View style={{ flex: 1 }}>
                <Text variant="subheading">{subject?.name ?? (s.reason === 'cards_due' ? t('flashcards.title') : t('suggestions.general'))}</Text>
                <Text variant="bodySmall" tone="muted">
                  {t(`suggestions.reasons.${s.reason}`, { count: s.daysLeft ?? 0, title: s.refTitle ?? '' })}
                </Text>
              </View>
              <Button
                size="md"
                variant="secondary"
                label={fmt.duration(s.minutes)}
                accessibilityHint={t('suggestions.planHint')}
                onPress={() =>
                  s.reason === 'cards_due'
                    ? router.push('/flashcards/review')
                    : router.push({ pathname: '/planner/session', params: { subjectId: s.subjectId ?? '', minutes: String(s.minutes), day: data.today } })
                }
              />
            </Row>
          );
        })}
      </Panel>
    ) : null,
    goals: (
      <Panel key="goals" title={t('goals.title')} icon="flag-outline" action={t('common.manage')} onAction={() => router.push('/goals')}>
        {data.goals.length === 0 ? (
          <Pressable onPress={() => router.push('/goals/edit')} accessibilityRole="button">
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
              {t('goals.addFirst')}
            </Text>
          </Pressable>
        ) : (
          data.goals.slice(0, 4).map((g) => (
            <Stack key={g.goal.id} gap={1}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                  {t(`goals.periods.${g.goal.period}`)} · {g.goal.title || t(`goals.metrics.${g.goal.metric}`)}
                </Text>
                <Text variant="bodySmall" tone={g.met ? 'success' : 'muted'}>
                  {g.goal.metric === 'minutes' ? `${fmt.duration(g.value)} / ${fmt.duration(g.goal.target)}` : `${g.value} / ${g.goal.target}`}
                </Text>
              </Row>
              <ProgressBar progress={g.ratio} tone={g.met ? 'success' : 'primary'} label={t(`goals.metrics.${g.goal.metric}`)} />
            </Stack>
          ))
        )}
      </Panel>
    ),
    reviews: (
      <Panel key="reviews" title={t('home.reviews')} icon="albums-outline">
        <Row gap={3}>
          <Text variant="title" tone="primary">
            {fmt.number(data.dueCards)}
          </Text>
          <Text tone="muted" style={{ flex: 1 }}>
            {t('home.cardsDue', { count: data.dueCards })}
          </Text>
          <Button size="md" label={t('flashcards.reviewNow')} disabled={data.dueCards === 0} onPress={() => router.push('/flashcards/review')} />
        </Row>
      </Panel>
    ),
    exams: (
      <Panel key="exams" title={t('agenda.upcoming')} icon="alarm-outline" action={t('common.seeAll')} onAction={() => router.push('/agenda')}>
        {data.upcoming.length === 0 ? (
          <Text variant="bodySmall" tone="muted">
            {t('agenda.noneUpcoming')}
          </Text>
        ) : (
          data.upcoming.map((u) => (
            <Pressable key={u.id} onPress={() => router.push({ pathname: '/agenda/[id]', params: { id: u.id, table: u.table } })} accessibilityRole="button">
              <Row gap={3} style={{ paddingVertical: 2 }}>
                <View style={{ width: 52, alignItems: 'center', backgroundColor: u.daysLeft <= 3 ? theme.colors.dangerSoft : theme.colors.surfaceAlt, borderRadius: 10, paddingVertical: 4 }}>
                  <Text variant="subheading" tone={u.daysLeft <= 3 ? 'danger' : 'default'}>
                    {u.daysLeft === 0 ? t('agenda.todayShort') : fmt.number(u.daysLeft)}
                  </Text>
                  {u.daysLeft > 0 ? (
                    <Text variant="caption" tone="subtle">
                      {t('agenda.days', { count: u.daysLeft })}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{u.title}</Text>
                  <Text variant="caption" tone="subtle">
                    {t(`agenda.kinds.${u.kind}`)} · {fmt.day(u.day)}
                  </Text>
                </View>
              </Row>
            </Pressable>
          ))
        )}
      </Panel>
    ),
    week: (
      <Panel key="week" title={t('home.thisWeek')} icon="bar-chart-outline" action={t('stats.title')} onAction={() => router.push('/stats')}>
        <Text variant="bodySmall" tone="muted">
          {t('home.weekTotal', { value: fmt.duration(data.weekMinutes) })}
        </Text>
        <BarChart data={data.week.map((d) => ({ label: fmt.weekdayNarrow(d.day), value: d.minutes }))} highlightLast={false} />
      </Panel>
    ),
    courses: data.courses.length ? (
      <Panel key="courses" title={t('home.inProgress')} icon="book-outline">
        {data.courses.map((c) => (
          <Pressable key={c.id} onPress={() => router.push({ pathname: '/course/[id]', params: { id: c.id } })} accessibilityRole="button" accessibilityLabel={c.title}>
            <Row gap={3}>
              <SubjectIcon icon={c.icon} color={c.color} size={36} />
              <Stack gap={1} style={{ flex: 1 }}>
                <Text numberOfLines={1}>{c.title}</Text>
                <ProgressBar progress={c.chapters ? c.chaptersDone / c.chapters : 0} height={6} label={c.title} />
              </Stack>
              <Text variant="caption" tone="subtle">
                {c.chaptersDone}/{c.chapters}
              </Text>
            </Row>
          </Pressable>
        ))}
      </Panel>
    ) : null,
    subjects: (
      <Panel key="subjects" title={t('courses.subjects')} icon="folder-open-outline" action={t('common.seeAll')} onAction={() => router.push('/(tabs)/courses')}>
        {data.subjects.length === 0 ? (
          <EmptyState icon="sparkles-outline" title={t('home.emptyTitle')} message={t('home.emptyBody')} action={<Button label={t('templates.browse')} onPress={() => router.push('/templates')} />} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {data.subjects.map((s) => (
              <Pressable key={s.id} onPress={() => router.push({ pathname: '/subject/[id]', params: { id: s.id } })} accessibilityRole="button" accessibilityLabel={s.name} style={{ width: 112, gap: 6, alignItems: 'center' }}>
                <SubjectIcon icon={s.icon} color={s.color} size={48} />
                <Text variant="bodySmall" center numberOfLines={2}>
                  {s.name}
                </Text>
                <Pill label={fmt.percent(s.progress)} color={s.color} />
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Panel>
    ),
  };

  return (
    <Screen testID="home-screen">
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="subtle">
            {fmt.dayLong(data.today)}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {greeting}
          </Text>
        </View>
        <IconButton icon="options-outline" label={t('home.customize')} onPress={() => router.push('/settings/dashboard')} />
      </Row>
      {data.missedCount > 0 ? (
        <Pressable onPress={() => router.push('/(tabs)/planner')} accessibilityRole="button">
          <Row gap={2} style={{ backgroundColor: theme.colors.warningSoft, padding: 12, borderRadius: theme.radius.md }}>
            <Icon name="calendar-clear-outline" size={18} color={theme.colors.warning} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t('home.missed', { count: data.missedCount })}
            </Text>
          </Row>
        </Pressable>
      ) : null}
      {cards.map((c) => sections[c] ?? null)}
      <AdBanner />
    </Screen>
  );
}
