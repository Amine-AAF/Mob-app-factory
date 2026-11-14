import { Button, Card, Chip, EmptyState, OptionCard, ProgressBar, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { FREE_LIMITS } from '@/constants/limits';
import { repos } from '@/database';
import { answerRound, buildQuiz, correctDisplayIndex, filterItems, reviewQueue, toRound, type QuizRound, type QuizScore, type RoundAnswer } from '@/features/quizzes/engine';
import { useQuizzes } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { finishQuiz } from '@/services/library';
import { useIsPremium } from '@/store/session';
import { CATEGORIES, type CategoryId } from '@/types/content';

type Phase = 'setup' | 'playing' | 'done';

export default function QuizScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ category?: string; mode?: string }>();
  const isPremium = useIsPremium();
  const items = useQuizzes();
  const isReview = params.mode === 'review';

  const available = useMemo(() => filterItems(items, { includePremium: isPremium }), [items, isPremium]);
  const quizCategories = useMemo(() => CATEGORIES.filter((c) => available.some((i) => i.category === c)), [available]);
  const initialCategory = quizCategories.find((c) => c === params.category) ?? null;

  const [category, setCategory] = useState<CategoryId | null>(initialCategory);
  const [phase, setPhase] = useState<Phase>('setup');
  const [rounds, setRounds] = useState<QuizRound[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState<QuizScore | null>(null);
  const [startedAt, setStartedAt] = useState('');

  const start = async () => {
    const pool = category ? available.filter((i) => i.category === category) : available;
    const seed = Date.now() % 1_000_000;
    let next: QuizRound[];
    if (isReview) {
      const cards = await repos().review.getCards('quiz');
      next = reviewQueue(pool, cards, clock.today(), FREE_LIMITS.quizLength).map((item, i) => toRound(item, seed + i));
    } else {
      next = buildQuiz(pool, FREE_LIMITS.quizLength, seed);
    }
    setRounds(next);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setStartedAt(clock.now().toISOString());
    setPhase('playing');
  };

  const round = rounds[index];

  const choose = (displayIndex: number) => {
    if (!round || selected !== null) return;
    setSelected(displayIndex);
    setAnswers((a) => [...a, answerRound(round, displayIndex)]);
  };

  const next = async () => {
    if (index + 1 < rounds.length) {
      setIndex((i) => i + 1);
      setSelected(null);
      return;
    }
    try {
      setScore(await finishQuiz({ mode: isReview ? 'review' : 'quiz', category, startedAt, answers }));
    } catch (e) {
      recordError(e, 'finish_quiz');
    }
    setPhase('done');
  };

  const title = isReview ? t('quiz.reviewTitle') : t('quiz.title');

  if (phase === 'setup') {
    return (
      <Screen edges={[]} testID="quiz-setup">
        <RouterStack.Screen options={{ title }} />
        <Text variant="title">{title}</Text>
        <Text tone="muted">{isReview ? t('quiz.reviewIntro') : t('quiz.intro', { count: FREE_LIMITS.quizLength })}</Text>
        <ScrollView horizontal={false}>
          <Row wrap gap={2}>
            <Chip label={t('common.all')} selected={category === null} onPress={() => setCategory(null)} />
            {quizCategories.map((c) => (
              <Chip key={c} label={t(`categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} testID={`quiz-cat-${c}`} />
            ))}
          </Row>
        </ScrollView>
        {!isPremium ? (
          <Text variant="caption" tone="subtle">
            {t('quiz.freeNote')}
          </Text>
        ) : null}
        <Button label={t('common.start')} size="lg" onPress={() => start().catch((e) => recordError(e, 'start_quiz'))} testID="quiz-start" />
      </Screen>
    );
  }

  if (phase === 'playing' && !round) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        <EmptyState icon="checkmark-done-outline" title={isReview ? t('quiz.nothingToReview') : t('quiz.noItems')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  if (phase === 'done') {
    return (
      <Screen edges={[]} testID="quiz-done">
        <RouterStack.Screen options={{ title }} />
        <Text variant="title">{t('quiz.doneTitle')}</Text>
        <Card tone="primary">
          <Stack gap={2}>
            <Text variant="display" center>
              {score ? `${score.correct}/${score.total}` : '-'}
            </Text>
            <Text center tone="muted">
              {t('quiz.percent', { percent: score?.percent ?? 0 })}
            </Text>
          </Stack>
        </Card>
        <Text tone="muted">{t('quiz.srsNote')}</Text>
        <Button label={t('quiz.again')} onPress={() => setPhase('setup')} testID="quiz-again" />
        <Button label={t('quiz.reviewMistakes')} variant="secondary" onPress={() => router.replace({ pathname: '/quiz', params: { mode: 'review' } })} />
        <Button label={t('common.done')} variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const item = round!.item;
  const answered = selected !== null;
  const correctIdx = correctDisplayIndex(round!);
  const labels = item.type === 'true-false' ? [t('quiz.true'), t('quiz.false')] : round!.order.map((i) => item.options![i]!);

  return (
    <Screen edges={[]} testID="quiz-playing">
      <RouterStack.Screen options={{ title }} />
      <ProgressBar progress={(index + (answered ? 1 : 0)) / rounds.length} label={t('quiz.progress', { current: index + 1, total: rounds.length })} />
      <Text variant="caption" tone="muted">
        {t('quiz.progress', { current: index + 1, total: rounds.length })} · {t(`categories.${item.category}`)}
      </Text>
      <Text variant="heading" accessibilityRole="header">
        {item.type === 'true-false' ? t('quiz.trueOrFalse') : ''}
        {item.prompt}
      </Text>
      <Stack gap={2}>
        {labels.map((label, i) => (
          <OptionCard
            key={`${item.id}-${i}`}
            title={label}
            selected={selected === i}
            onPress={() => choose(i)}
            state={!answered ? 'idle' : i === correctIdx ? 'correct' : i === selected ? 'wrong' : 'idle'}
            role="radio"
            testID={`quiz-option-${i}`}
          />
        ))}
      </Stack>
      {answered ? (
        <Card tone="alt" testID="quiz-feedback">
          <Stack gap={2}>
            <Text variant="subheading" tone={selected === correctIdx ? 'success' : 'danger'}>
              {selected === correctIdx ? t('quiz.correct') : t('quiz.incorrect')}
            </Text>
            <Text>{item.explanation}</Text>
            {item.relatedQuestionId ? (
              <Button
                label={t('quiz.openQuestion')}
                variant="ghost"
                icon="book-outline"
                onPress={() => router.push({ pathname: '/question/[id]', params: { id: item.relatedQuestionId! } })}
              />
            ) : null}
          </Stack>
        </Card>
      ) : null}
      {answered ? <Button label={index + 1 < rounds.length ? t('common.next') : t('quiz.seeScore')} size="lg" onPress={next} testID="quiz-next" /> : null}
    </Screen>
  );
}
