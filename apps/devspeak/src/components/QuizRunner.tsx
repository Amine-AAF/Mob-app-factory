import { Button, Card, OptionCard, ProgressBar, Stack, Text } from '@factory/design-system';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { QuizQuestion } from '@/content/types';

export interface QuizResult {
  correct: number;
  total: number;
  answers: { questionId: string; chosen: number; correct: boolean }[];
}

/** Pure scoring, exported for tests. */
export function gradeQuiz(questions: QuizQuestion[], chosen: Record<string, number>): QuizResult {
  const answers = questions.map((q) => ({ questionId: q.id, chosen: chosen[q.id] ?? -1, correct: chosen[q.id] === q.correctIndex }));
  return { correct: answers.filter((a) => a.correct).length, total: questions.length, answers };
}

/** Renders a "fill" prompt with the blank visually marked. */
export function renderPrompt(q: QuizQuestion, fill?: string): string {
  return q.type === 'fill' ? q.prompt.replace('___', fill ? `“${fill}”` : '_____') : q.prompt;
}

/**
 * One-question-at-a-time quiz with immediate feedback and explanations.
 * Answers are locked after "Check" so a score can't be gamed by re-tapping.
 */
export function QuizRunner({ questions, onFinish, testID }: { questions: QuizQuestion[]; onFinish: (r: QuizResult) => void; testID?: string }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const q = questions[index];
  const isLast = index === questions.length - 1;

  const progress = useMemo(() => (questions.length ? (index + (checked ? 1 : 0)) / questions.length : 0), [index, checked, questions.length]);
  if (!q) return null;

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    setChosen((c) => ({ ...c, [q.id]: selected }));
    const ok = selected === q.correctIndex;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  };

  const next = () => {
    if (isLast) {
      onFinish(gradeQuiz(questions, { ...chosen, [q.id]: selected ?? -1 }));
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  const correct = selected === q.correctIndex;
  return (
    <Stack gap={4} testID={testID}>
      <Stack gap={2}>
        <Text variant="caption" tone="muted">
          {t('quiz.questionOf', { current: index + 1, total: questions.length })}
        </Text>
        <ProgressBar progress={progress} tone="accent" label={t('quiz.questionOf', { current: index + 1, total: questions.length })} />
      </Stack>
      <Text variant="heading" accessibilityLiveRegion="polite">
        {renderPrompt(q, checked ? q.options[q.correctIndex] : selected !== null ? q.options[selected] : undefined)}
      </Text>
      <Stack gap={3}>
        {q.options.map((opt, i) => (
          <OptionCard
            key={`${q.id}-${i}`}
            title={opt}
            selected={selected === i}
            onPress={checked ? undefined : () => setSelected(i)}
            state={checked ? (i === q.correctIndex ? 'correct' : i === selected ? 'wrong' : 'idle') : 'idle'}
            testID={`option-${i}`}
          />
        ))}
      </Stack>
      {checked ? (
        <Card tone={correct ? 'accent' : 'alt'}>
          <Text variant="subheading" tone={correct ? 'success' : 'danger'} accessibilityLiveRegion="assertive">
            {correct ? t('quiz.correct') : t('quiz.incorrect')}
          </Text>
          {!correct ? <Text variant="bodySmall">{t('quiz.correctAnswer', { answer: q.options[q.correctIndex] })}</Text> : null}
          <Text variant="bodySmall" tone="muted">
            {q.explanation}
          </Text>
        </Card>
      ) : null}
      <View style={{ marginTop: 4 }}>
        {checked ? (
          <Button label={isLast ? t('quiz.finish') : t('common.next')} onPress={next} testID="quiz-next" />
        ) : (
          <Button label={t('quiz.check')} onPress={check} disabled={selected === null} testID="quiz-check" />
        )}
      </View>
    </Stack>
  );
}
