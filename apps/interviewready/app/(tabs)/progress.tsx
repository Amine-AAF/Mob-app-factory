import { EmptyState, ListRow, Row, Screen, SectionHeader, Stat, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AdvancedStats } from '@/components/AdvancedStats';
import { ProgressCard } from '@/components/content';
import { allQuestionCores } from '@/content';
import { repos } from '@/database';
import { preparationProgress, streak } from '@/features/progress/summary';
import { useAsync } from '@/hooks/useAsync';
import { useQuestions } from '@/hooks/useContent';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { useSession } from '@/store/session';

export default function ProgressScreen() {
  const { t } = useTranslation();
  const role = useSession((s) => s.profile?.jobRole ?? null);
  const questions = useQuestions();
  const today = clock.today();

  const { data } = useAsync(async () => {
    const [studied, favorites, attempts, activeDays, dailyHistory, due] = await Promise.all([
      repos().library.studiedIds(),
      repos().library.favoriteCount(),
      repos().review.recentAttempts(50),
      repos().activity.activeDays(),
      repos().library.dailyHistory(14),
      repos().review.dueCount('quiz', today),
    ]);
    return { studied, favorites, attempts, activeDays, dailyHistory, due };
  }, [today]);

  const progress = useMemo(() => preparationProgress(allQuestionCores(), data?.studied ?? new Set(), role), [data, role]);
  const days = streak(data?.activeDays ?? [], today);
  const quizTotals = (data?.attempts ?? []).reduce((acc, a) => ({ correct: acc.correct + a.correct, total: acc.total + a.total }), { correct: 0, total: 0 });
  const accuracy = quizTotals.total ? Math.round((quizTotals.correct / quizTotals.total) * 100) : null;

  return (
    <Screen testID="progress">
      <Text variant="title" accessibilityRole="header">
        {t('progress.title')}
      </Text>
      <Text tone="muted">{t('progress.subtitle')}</Text>

      <Row gap={3}>
        <Stat value={fmt.number(days.current)} label={t('progress.streak')} icon="flame-outline" tone="warning" />
        <Stat value={fmt.number(progress.studied)} label={t('progress.studied')} icon="checkmark-done-outline" tone="success" />
      </Row>
      <Row gap={3}>
        <Stat value={accuracy === null ? '-' : `${accuracy}%`} label={t('progress.quizAccuracy')} icon="stats-chart-outline" />
        <Stat value={fmt.number(data?.favorites ?? 0)} label={t('progress.favorites')} icon="bookmark-outline" tone="accent" />
      </Row>

      <ProgressCard title={role ? t(`roles.${role}`) : t('home.allQuestions')} studied={progress.studied} total={progress.total} />

      <AdvancedStats />

      <SectionHeader title={t('progress.byCategory')} />
      {progress.byCategory.map((c) => (
        <ProgressCard key={c.category} title={t(`categories.${c.category}`)} studied={c.studied} total={c.total} onPress={() => router.push({ pathname: '/questions', params: { category: c.category } })} />
      ))}

      <SectionHeader title={t('progress.reviewTitle')} />
      <ListRow
        title={t('progress.reviewDue', { count: data?.due ?? 0 })}
        subtitle={t('progress.reviewHint')}
        icon="refresh-circle-outline"
        onPress={() => router.push({ pathname: '/quiz', params: { mode: 'review' } })}
      />

      <SectionHeader title={t('progress.dailyHistory')} />
      {data?.dailyHistory.length ? (
        data.dailyHistory.map((d) => {
          const q = questions.find((x) => x.id === d.questionId);
          return (
            <ListRow
              key={d.day}
              title={q?.question ?? d.questionId}
              subtitle={fmt.date(new Date(`${d.day}T12:00:00`), { day: 'numeric', month: 'short' })}
              icon={d.studied ? 'checkmark-circle' : 'ellipse-outline'}
              onPress={() => router.push({ pathname: '/question/[id]', params: { id: d.questionId } })}
            />
          );
        })
      ) : (
        <EmptyState icon="sunny-outline" title={t('progress.dailyEmpty')} />
      )}
    </Screen>
  );
}
