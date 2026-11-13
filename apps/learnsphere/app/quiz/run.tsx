import { Button, ProgressBar, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState, BackHandler, View } from 'react-native';

import { QuestionView } from '@/components/QuestionView';
import type { QuizQuestion } from '@/content/types';
import { repos } from '@/database';
import { emptyAnswer, gradeAnswer, isAnswered, pickQuestions, remainingSeconds, scoreQuiz, type Answer, type QuizMode } from '@/features/quiz/engine';
import { formatCountdown } from '@/features/focus/pomodoro';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterLearningWrite } from '@/services/progress';

/** Quiz runner. No ads. The exam timer is computed from the start timestamp (robust to backgrounding). */
export default function QuizRun() {
  const { t } = useTranslation();
  const theme = useTheme();
  const p = useLocalSearchParams<{ bank: string; mode: QuizMode; count: string; timeLimit?: string; difficulty?: string; seed: string }>();
  const seed = Number(p.seed) || 1;
  const timeLimitS = p.timeLimit ? Number(p.timeLimit) : null;
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const finished = useRef(false);

  useEffect(() => {
    void repos()
      .quiz.questions(p.bank)
      .then((pool) => {
        const picked = pickQuestions(pool, { count: Number(p.count) || 10, difficulty: p.difficulty ? (Number(p.difficulty) as 1 | 2 | 3) : null, seed });
        setQuestions(picked);
        setAnswers(picked.map(emptyAnswer));
        setStartedAt(Date.now());
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, []);

  const finish = useCallback(async () => {
    if (finished.current || !questions) return;
    finished.current = true;
    const result = scoreQuiz(questions, answers);
    const end = clock.now();
    const id = await repos().quiz.saveAttempt({
      bankId: p.bank,
      subjectId: null,
      mode: p.mode,
      startedAt: new Date(startedAt).toISOString(),
      finishedAt: end.toISOString(),
      day: clock.today(),
      durationMs: Date.now() - startedAt,
      timeLimitS,
      total: result.total,
      correct: result.correct,
      score: result.score,
      answers: questions.map((q, i) => ({ questionId: q.id, correct: result.perQuestion[i]?.correct ?? false, answer: answers[i] ?? emptyAnswer(q) })),
    });
    track('quiz_completed', { bank: p.bank.length > 12 ? 'custom' : p.bank, mode: p.mode, score: result.score });
    await afterLearningWrite(repos());
    router.replace({ pathname: '/quiz/result', params: { attempt: id } });
  }, [questions, answers, p.bank, p.mode, timeLimitS, startedAt]);

  // Display tick only; remaining time is always derived from timestamps.
  useEffect(() => {
    if (timeLimitS == null) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    const sub = AppState.addEventListener('change', () => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [timeLimitS]);

  const remaining = remainingSeconds(startedAt, timeLimitS, now);
  useEffect(() => {
    if (remaining === 0 && questions) void finish();
  }, [remaining, questions, finish]);

  const confirmQuit = useCallback(() => {
    Alert.alert(t('quiz.quitTitle'), t('quiz.quitBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('quiz.quit'), style: 'destructive', onPress: () => router.back() },
    ]);
    return true;
  }, [t]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', confirmQuit);
    return () => sub.remove();
  }, [confirmQuit]);

  if (!questions) return <Screen edges={[]}>{null}</Screen>;
  const q = questions[index];
  if (!q) return <Screen edges={[]}>{null}</Screen>;
  const answer = answers[index] ?? emptyAnswer(q);
  const last = index === questions.length - 1;
  const practice = p.mode === 'practice';

  const next = () => {
    if (practice && !revealed) return setRevealed(true);
    setRevealed(false);
    if (last) void finish();
    else setIndex(index + 1);
  };

  return (
    <Screen
      edges={['bottom']}
      footer={
        <Row gap={2}>
          {!practice && index > 0 ? <Button label={t('common.back')} variant="secondary" onPress={() => setIndex(index - 1)} /> : null}
          <View style={{ flex: 1 }}>
            <Button
              label={practice && !revealed ? t('quiz.check') : last ? t('quiz.finish') : t('quiz.next')}
              onPress={next}
              disabled={practice && !revealed && !isAnswered(answer)}
              testID="quiz-next"
            />
          </View>
        </Row>
      }
    >
      <RouterStack.Screen options={{ title: t(`quiz.modes.${p.mode}`), headerLeft: undefined }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="bodySmall" tone="muted">
          {t('quiz.questionOf', { current: index + 1, total: questions.length })}
        </Text>
        {remaining != null ? (
          <Text variant="subheading" tone={remaining < 60 ? 'danger' : 'default'} accessibilityLabel={t('quiz.timeLeft', { time: formatCountdown(remaining * 1000) })}>
            {formatCountdown(remaining * 1000)}
          </Text>
        ) : null}
        {practice ? (
          <Text variant="bodySmall" tone="success">
            {t('quiz.scoreSoFar', { count: answers.slice(0, index + (revealed ? 1 : 0)).filter((a, i) => questions[i] && gradeAnswer(questions[i] as QuizQuestion, a)).length })}
          </Text>
        ) : null}
      </Row>
      <ProgressBar progress={(index + (revealed ? 1 : 0)) / questions.length} label={t('quiz.questionOf', { current: index + 1, total: questions.length })} />
      <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border }}>
        <QuestionView
          key={q.id}
          question={q}
          answer={answer}
          seed={seed + index}
          reveal={practice && revealed}
          onChange={(a) => setAnswers((prev) => prev.map((x, i) => (i === index ? a : x)))}
        />
      </View>
    </Screen>
  );
}
