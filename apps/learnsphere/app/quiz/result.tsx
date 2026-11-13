import { Button, Row, Screen, Stack, Stat, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { QuestionView } from '@/components/QuestionView';
import { ProgressRing, Segmented } from '@/components/ui';
import { repos } from '@/database';
import { formatCountdown } from '@/features/focus/pomodoro';
import { useAsync } from '@/hooks/useAsync';

/** Score + full correction with explanations. */
export default function QuizResult() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { attempt: attemptId } = useLocalSearchParams<{ attempt: string }>();
  const [filter, setFilter] = useState<'all' | 'wrong'>('all');
  const { data } = useAsync(async () => {
    const attempt = await repos().quiz.getAttempt(attemptId);
    const questions = attempt ? await repos().quiz.questionsByIds(attempt.answers.map((a) => a.questionId)) : [];
    return { attempt, questions };
  }, [attemptId]);
  if (!data?.attempt) return <Screen edges={[]}>{null}</Screen>;
  const a = data.attempt;
  const items = data.questions
    .map((q) => ({ q, entry: a.answers.find((x) => x.questionId === q.id) }))
    .filter((x) => x.entry && (filter === 'all' || !x.entry.correct));

  return (
    <Screen edges={[]} testID="quiz-result">
      <RouterStack.Screen options={{ title: t('quiz.results') }} />
      <Stack gap={3} style={{ alignItems: 'center' }}>
        <ProgressRing progress={a.score / 100} size={120} label={`${a.score}%`} sublabel={t('quiz.score')} color={a.score >= 80 ? theme.colors.success : a.score >= 50 ? theme.colors.primary : theme.colors.danger} />
        <Text variant="title" center>
          {t(a.score >= 80 ? 'quiz.feedback.great' : a.score >= 50 ? 'quiz.feedback.good' : 'quiz.feedback.keepGoing')}
        </Text>
      </Stack>
      <Row gap={3}>
        <Stat value={`${a.correct}/${a.total}`} label={t('quiz.correctAnswers')} icon="checkmark-done-outline" tone="success" />
        <Stat value={formatCountdown(a.durationMs)} label={t('quiz.duration')} icon="time-outline" />
      </Row>
      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button label={t('quiz.retry')} variant="secondary" icon="refresh" onPress={() => router.replace({ pathname: '/quiz/bank', params: { bank: a.bankId } })} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('common.done')} onPress={() => router.back()} testID="result-done" />
        </View>
      </Row>
      <Text variant="heading" accessibilityRole="header">
        {t('quiz.correction')}
      </Text>
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: t('quiz.allQuestions') },
          { value: 'wrong', label: t('quiz.mistakesOnly') },
        ]}
      />
      {items.map(({ q, entry }, i) => (
        <View key={q.id} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
          <QuestionView question={q} answer={entry!.answer} onChange={() => undefined} reveal seed={i + 1} />
        </View>
      ))}
    </Screen>
  );
}
