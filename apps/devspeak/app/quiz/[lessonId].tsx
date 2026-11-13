import { scorePercent } from '@factory/app-core';
import { Badge, Button, Card, EmptyState, Icon, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { QuizRunner, type QuizResult } from '@/components/QuizRunner';
import { repos } from '@/database';
import type { CompletionResult } from '@/database/repositories/progressRepository';
import { canAccessLesson } from '@/features/learning/recommendations';
import { useAsync } from '@/hooks/useAsync';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useIsPremium, useSession } from '@/store/session';

export default function QuizScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [result, setResult] = useState<{ quiz: QuizResult; completion: CompletionResult } | null>(null);
  const { data } = useAsync(async () => {
    const lesson = await repos().content.getLesson(lessonId);
    return { lesson, questions: await repos().content.getQuiz('lesson', lessonId) };
  }, [lessonId]);
  // Note: data reloads on bump(); keep the result screen stable by not depending on data after finishing.

  const finish = async (quiz: QuizResult) => {
    const score = scorePercent(quiz.correct, quiz.total);
    try {
      const completion = await repos().progress.completeLesson(lessonId, score, clock.now());
      setResult({ quiz, completion });
      track('quiz_completed', { owner: lessonId, score });
      track('lesson_completed', { lesson_id: lessonId, module: data?.lesson?.moduleId ?? 'unknown', score, first_time: completion.firstCompletion });
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'quiz_finish');
    }
  };

  if (data && (!data.lesson || data.questions.length === 0)) return <EmptyState icon="alert-circle-outline" title={t('lesson.notFound')} />;
  if (data?.lesson && !canAccessLesson(data.lesson, isPremium)) {
    router.replace({ pathname: '/paywall', params: { source: 'quiz_locked' } });
    return null;
  }

  if (result) {
    const pct = scorePercent(result.quiz.correct, result.quiz.total);
    const message = pct === 100 ? t('quiz.perfect') : pct >= 60 ? t('quiz.good') : t('quiz.tryAgain');
    return (
      <Screen edges={['top', 'bottom']} testID="quiz-result">
        <RouterStack.Screen options={{ headerShown: false }} />
        <Stack gap={5} style={{ alignItems: 'center', paddingTop: 40 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: pct >= 60 ? theme.colors.successSoft : theme.colors.warningSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={pct === 100 ? 'trophy' : pct >= 60 ? 'checkmark-done' : 'refresh'} size={54} color={pct >= 60 ? theme.colors.success : theme.colors.warning} />
          </View>
          <Text variant="title" center>
            {t('quiz.resultTitle')}
          </Text>
          <Text variant="display" center accessibilityLabel={`${pct}%`}>
            {pct}%
          </Text>
          <Text tone="muted" center>
            {t('quiz.score', { correct: result.quiz.correct, total: result.quiz.total })} · {message}
          </Text>
          {result.completion.xpEarned > 0 ? (
            <Badge label={t('quiz.xpEarned', { count: result.completion.xpEarned })} tone="accent" icon="flash" />
          ) : (
            <Text variant="caption" tone="subtle" center>
              {t('quiz.noXpRepeat')}
            </Text>
          )}
          {result.completion.newAchievements.map((a) => (
            <Card key={a} tone="accent" style={{ alignSelf: 'stretch' }}>
              <Text variant="subheading" center>
                🏅 {t('quiz.newAchievement', { name: t(`achievements.${a}`) })}
              </Text>
            </Card>
          ))}
        </Stack>
        <Stack gap={3} style={{ marginTop: 24 }}>
          <Button label={t('quiz.backToLesson')} variant="secondary" onPress={() => router.back()} />
          <Button label={t('quiz.backHome')} onPress={() => router.dismissTo('/(tabs)')} testID="quiz-home" />
        </Stack>
      </Screen>
    );
  }

  return (
    <>
      <RouterStack.Screen options={{ title: t('quiz.title') }} />
      <Screen edges={[]}>
        {data?.lesson ? (
          <Text variant="caption" tone="muted">
            {data.lesson.title}
          </Text>
        ) : null}
        {data ? <QuizRunner questions={data.questions} onFinish={finish} /> : null}
      </Screen>
    </>
  );
}
