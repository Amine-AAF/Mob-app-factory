import { Badge, Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { JobCategoryCard, ProgressCard, QuestionCard } from '@/components/content';
import { allQuestionCores } from '@/content';
import { repos } from '@/database';
import { preparationProgress } from '@/features/progress/summary';
import { dailyQuestionId } from '@/features/questions/daily';
import { canReadAnswer, matchesRole } from '@/features/questions/search';
import { useAsync } from '@/hooks/useAsync';
import { useQuestions } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useIsPremium, useSession } from '@/store/session';

export default function HomeScreen() {
  const { t } = useTranslation();
  const profile = useSession((s) => s.profile);
  const isPremium = useIsPremium();
  const questions = useQuestions();
  const today = clock.today();
  const role = profile?.jobRole ?? null;

  const dailyId = useMemo(() => dailyQuestionId(today, allQuestionCores(), role), [today, role]);
  const daily = questions.find((q) => q.id === dailyId);

  useEffect(() => {
    if (dailyId) repos().library.logDaily(today, dailyId).catch((e) => recordError(e, 'log_daily'));
  }, [dailyId, today]);

  const { data } = useAsync(async () => {
    const [studied, favorites, history, dailyLog] = await Promise.all([
      repos().library.studiedIds(),
      repos().library.favoriteIds(),
      repos().library.recentHistory(5),
      repos().library.dailyHistory(1),
    ]);
    return { studied, favorites: new Set(favorites), history, dailyStudied: dailyLog[0]?.day === today && dailyLog[0].studied };
  }, [today]);

  const progress = useMemo(() => preparationProgress(allQuestionCores(), data?.studied ?? new Set(), role), [data, role]);
  const continueQuestion = useMemo(() => {
    const next = data?.history.find((h) => !h.studiedAt);
    return next ? questions.find((q) => q.id === next.questionId) : undefined;
  }, [data, questions]);
  const recent = (data?.history ?? []).slice(0, 3).map((h) => questions.find((q) => q.id === h.questionId)).filter((q) => q !== undefined);
  const roleCount = role ? questions.filter((q) => matchesRole(q, role)).length : 0;
  const open = (id: string) => router.push({ pathname: '/question/[id]', params: { id } });

  return (
    <Screen testID="home">
      <Stack gap={1}>
        <Text variant="caption" tone="primary">
          {t('app.name')}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {t('home.greeting')}
        </Text>
        {role ? (
          <Text tone="muted">{t('home.preparingFor', { role: t(`roles.${role}`) })}</Text>
        ) : (
          <Text tone="muted">{t('home.noRole')}</Text>
        )}
      </Stack>

      <SectionHeader title={t('home.dailyTitle')} />
      {daily ? (
        <Card tone="primary" onPress={() => router.push({ pathname: '/question/[id]', params: { id: daily.id, daily: '1' } })} testID="daily-question" accessibilityLabel={daily.question}>
          <Stack gap={2}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Badge label={t(`skills.${daily.skills[0]}`)} tone="primary" icon="ribbon-outline" />
              {data?.dailyStudied ? <Badge label={t('question.studied')} tone="success" icon="checkmark" /> : null}
            </Row>
            <Text variant="heading">{daily.question}</Text>
            <Text variant="bodySmall" tone="muted" numberOfLines={2}>
              {daily.tips[0]}
            </Text>
            <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
              {t('home.dailyCta')}
            </Text>
          </Stack>
        </Card>
      ) : null}

      {continueQuestion ? (
        <>
          <SectionHeader title={t('home.continueTitle')} />
          <QuestionCard question={continueQuestion} onPress={() => open(continueQuestion.id)} favorite={data?.favorites.has(continueQuestion.id)} locked={!canReadAnswer(continueQuestion, isPremium)} />
        </>
      ) : null}

      <SectionHeader title={t('home.progressTitle')} action={t('common.seeAll')} onAction={() => router.push('/(tabs)/progress')} />
      <ProgressCard title={role ? t(`roles.${role}`) : t('home.allQuestions')} studied={progress.studied} total={progress.total} />

      <SectionHeader title={t('home.pathTitle')} />
      {role ? (
        <JobCategoryCard role={role} count={roleCount} onPress={() => router.push({ pathname: '/questions', params: { role } })} />
      ) : (
        <Card>
          <Stack gap={2}>
            <Text>{t('home.chooseRoleHint')}</Text>
            <Button label={t('home.exploreRoles')} variant="secondary" onPress={() => router.push('/(tabs)/explore')} />
          </Stack>
        </Card>
      )}
      <Button label={t('home.quickQuiz')} icon="flash-outline" variant="secondary" onPress={() => router.push('/quiz')} testID="home-quiz" />

      <SectionHeader title={t('home.recentTitle')} />
      {recent.length ? (
        recent.map((q) => <QuestionCard key={q.id} question={q} onPress={() => open(q.id)} studied={data?.studied.has(q.id)} favorite={data?.favorites.has(q.id)} locked={!canReadAnswer(q, isPremium)} />)
      ) : (
        <EmptyState icon="time-outline" title={t('home.recentEmpty')} message={t('home.recentEmptyHint')} />
      )}
    </Screen>
  );
}
