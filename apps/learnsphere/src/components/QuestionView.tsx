import { Chip, Icon, OptionCard, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { QuizQuestion } from '@/content/types';
import { gradeAnswer, optionOrder, type Answer } from '@/features/quiz/engine';

import { TextField } from './ui';

/**
 * Renders one question and its answer controls. When `reveal` is true, inputs are locked and
 * correct / wrong choices are marked, followed by the explanation.
 */
export function QuestionView({ question, answer, onChange, reveal, seed }: { question: QuizQuestion; answer: Answer; onChange: (a: Answer) => void; reveal: boolean; seed: number }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const order = useMemo(() => {
    if (question.type === 'single' || question.type === 'multiple') return optionOrder(question.options.length, seed);
    if (question.type === 'matching') return optionOrder(question.pairs.length, seed + 7);
    return [];
  }, [question, seed]);
  const correct = reveal ? gradeAnswer(question, answer) : null;

  let body: React.ReactNode = null;
  switch (question.type) {
    case 'single': {
      const a = answer as Extract<Answer, { type: 'single' }>;
      body = order.map((i) => (
        <OptionCard
          key={i}
          title={question.options[i] ?? ''}
          selected={a.choice === i}
          state={reveal ? (i === question.correct ? 'correct' : a.choice === i ? 'wrong' : 'idle') : 'idle'}
          onPress={reveal ? undefined : () => onChange({ type: 'single', choice: i })}
          testID={`option-${i}`}
        />
      ));
      break;
    }
    case 'multiple': {
      const a = answer as Extract<Answer, { type: 'multiple' }>;
      body = order.map((i) => {
        const selected = a.choices.includes(i);
        const isCorrect = question.correct.includes(i);
        return (
          <OptionCard
            key={i}
            role="checkbox"
            title={question.options[i] ?? ''}
            selected={selected}
            state={reveal ? (isCorrect ? 'correct' : selected ? 'wrong' : 'idle') : 'idle'}
            onPress={reveal ? undefined : () => onChange({ type: 'multiple', choices: selected ? a.choices.filter((c) => c !== i) : [...a.choices, i] })}
            testID={`option-${i}`}
          />
        );
      });
      break;
    }
    case 'true_false': {
      const a = answer as Extract<Answer, { type: 'true_false' }>;
      body = ([true, false] as const).map((v) => (
        <OptionCard
          key={String(v)}
          title={t(v ? 'quiz.true' : 'quiz.false')}
          selected={a.value === v}
          state={reveal ? (v === question.correct ? 'correct' : a.value === v ? 'wrong' : 'idle') : 'idle'}
          onPress={reveal ? undefined : () => onChange({ type: 'true_false', value: v })}
          testID={`option-${v}`}
        />
      ));
      break;
    }
    case 'short_answer': {
      const a = answer as Extract<Answer, { type: 'short_answer' }>;
      body = (
        <Stack gap={2}>
          <TextField value={a.text} onChangeText={(text) => onChange({ type: 'short_answer', text })} editable={!reveal} placeholder={t('quiz.typeAnswer')} autoCapitalize="none" autoCorrect={false} testID="short-answer" />
          {reveal ? (
            <Text variant="bodySmall" tone={correct ? 'success' : 'danger'}>
              {t('quiz.acceptedAnswers', { answers: question.accepted.join(' · ') })}
            </Text>
          ) : null}
        </Stack>
      );
      break;
    }
    case 'matching': {
      const a = answer as Extract<Answer, { type: 'matching' }>;
      body = question.pairs.map((pair, left) => {
        const chosen = a.matches[left];
        return (
          <View key={left} style={{ gap: 6, padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: reveal ? (chosen === left ? theme.colors.success : theme.colors.danger) : theme.colors.border }}>
            <Text style={{ fontWeight: '700' }}>{pair.left}</Text>
            <Row gap={2} wrap>
              {order.map((right) => (
                <Chip
                  key={right}
                  label={question.pairs[right]?.right ?? ''}
                  selected={chosen === right}
                  onPress={() => {
                    if (reveal) return;
                    const next = [...a.matches];
                    next[left] = chosen === right ? null : right;
                    onChange({ type: 'matching', matches: next });
                  }}
                />
              ))}
            </Row>
            {reveal && chosen !== left ? (
              <Text variant="caption" tone="success">
                {t('quiz.correctMatch', { value: pair.right })}
              </Text>
            ) : null}
          </View>
        );
      });
      break;
    }
  }

  return (
    <Stack gap={3}>
      <Text variant="caption" tone="subtle">
        {t(`quiz.types.${question.type}`)} · {t(`quiz.levels.${question.difficulty}`)}
      </Text>
      <Text variant="heading" style={{ fontSize: 20, lineHeight: 28 }} testID="question-prompt">
        {question.prompt}
      </Text>
      <Stack gap={2}>{body}</Stack>
      {reveal ? (
        <View style={{ backgroundColor: correct ? theme.colors.successSoft : theme.colors.dangerSoft, borderRadius: theme.radius.md, padding: 12, gap: 4 }} accessibilityLiveRegion="polite">
          <Row gap={2}>
            <Icon name={correct ? 'checkmark-circle' : 'close-circle'} size={20} color={correct ? theme.colors.success : theme.colors.danger} />
            <Text variant="subheading" tone={correct ? 'success' : 'danger'}>
              {t(correct ? 'quiz.correct' : 'quiz.incorrect')}
            </Text>
          </Row>
          <Text variant="bodySmall">{question.explanation}</Text>
        </View>
      ) : null}
    </Stack>
  );
}
