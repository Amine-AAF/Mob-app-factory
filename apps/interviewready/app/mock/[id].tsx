import { Button, Card, EmptyState, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput } from 'react-native';

import { MockInterviewScreen, StarRating } from '@/components/practice';
import { repos } from '@/database';
import { ANSWER_TEXT_MAX, type MockAnswerRecord } from '@/database/repositories/practiceRepository';
import { averageRating, RATING_CRITERIA, secondsPerQuestion, summarizeMock, type MockDuration, type MockSummary, type Rating } from '@/features/mock-interview/session';
import { useQuestions } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { finishMockInterview } from '@/services/practice';

type Phase = 'loading' | 'answering' | 'rating' | 'summary';

interface Draft {
  questionId: string;
  answer: string;
  notes: string;
  skipped: boolean;
  secondsSpent: number;
  rating: Rating;
}

/**
 * Mock interview runner. No ads are ever displayed here, and no automatic grading is
 * claimed: the user rates their own answers with a transparent grid.
 */
export default function MockSession() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, review } = useLocalSearchParams<{ id: string; review?: string }>();
  const sessionId = Number(id);
  const questions = useQuestions();
  const [phase, setPhase] = useState<Phase>('loading');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [index, setIndex] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [perQuestion, setPerQuestion] = useState(120);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState<MockSummary | null>(null);
  const [role, setRole] = useState('general');
  /** Start time of the current question; set when a question is shown (never during render). */
  const startedAt = useRef(0);

  useEffect(() => {
    (async () => {
      const [sessions, answers] = await Promise.all([repos().practice.listMocks(200), repos().practice.getMockAnswers(sessionId)]);
      const session = sessions.find((s) => s.id === sessionId);
      if (!session || !answers.length) {
        setPhase('summary');
        return;
      }
      setRole(session.jobRole);
      setTimerOn(session.timerEnabled);
      setPerQuestion(secondsPerQuestion(session.minutes as MockDuration));
      const loaded = answers.map((a: MockAnswerRecord) => ({ questionId: a.questionId, answer: a.answer, notes: a.notes, skipped: a.skipped, secondsSpent: a.secondsSpent, rating: a.rating ?? {} }));
      setDrafts(loaded);
      // A completed session is read-only: show its summary instead of saving the assessment again.
      if (session.completedAt) {
        setSummary(summarizeMock(loaded));
        setPhase('summary');
      } else {
        setPhase(review === '1' ? 'rating' : 'answering');
      }
    })().catch((e) => recordError(e, 'mock_load'));
  }, [sessionId, review]);

  // Records when each question is shown. `elapsed` is reset in `advance()` (an event handler).
  useEffect(() => {
    if (phase === 'answering') startedAt.current = Date.now();
  }, [phase, index]);

  // Optional countdown: informative only, it never stops the user from answering.
  useEffect(() => {
    if (phase !== 'answering' || !timerOn) return;
    const handle = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(handle);
  }, [phase, timerOn, index]);

  const current = drafts[index];
  const question = questions.find((q) => q.id === current?.questionId);
  const update = (patch: Partial<Draft>, i = index) => setDrafts((all) => all.map((d, k) => (k === i ? { ...d, ...patch } : d)));

  const advance = (skipped: boolean) => {
    update({ skipped, secondsSpent: Math.floor((Date.now() - startedAt.current) / 1000) });
    setElapsed(0);
    if (index + 1 < drafts.length) {
      setIndex(index + 1);
    } else {
      setPhase('rating');
    }
  };

  const finish = async () => {
    try {
      const result = await finishMockInterview(sessionId, drafts, role);
      setSummary(result);
      setPhase('summary');
    } catch (e) {
      recordError(e, 'mock_finish');
      Alert.alert(t('common.error'));
    }
  };

  if (phase === 'loading') return <Screen edges={[]}>{null}</Screen>;

  if (phase === 'answering' && current && question) {
    return (
      <Screen edges={[]} testID="mock-answering">
        <RouterStack.Screen options={{ title: t('practice.mock.title'), headerBackVisible: false }} />
        <MockInterviewScreen index={index} total={drafts.length} question={question.question} secondsLeft={timerOn ? perQuestion - elapsed : null}>
          <Text variant="caption" tone="muted">
            {t('mock.answerHint')}
          </Text>
          <TextInput
            value={current.answer}
            onChangeText={(answer) => update({ answer })}
            placeholder={t('mock.answerPlaceholder')}
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            maxLength={ANSWER_TEXT_MAX}
            accessibilityLabel={t('mock.yourAnswer')}
            style={inputStyle(theme, 180)}
            testID="mock-answer"
          />
          <TextInput
            value={current.notes}
            onChangeText={(notes) => update({ notes })}
            placeholder={t('mock.notesPlaceholder')}
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            maxLength={ANSWER_TEXT_MAX}
            accessibilityLabel={t('mock.notes')}
            style={inputStyle(theme, 70)}
          />
          <Row gap={2}>
            <Button label={t('mock.skip')} variant="ghost" onPress={() => advance(true)} testID="mock-skip" />
            <Button label={index + 1 < drafts.length ? t('mock.nextQuestion') : t('mock.finishAnswers')} onPress={() => advance(false)} testID="mock-next" />
          </Row>
        </MockInterviewScreen>
      </Screen>
    );
  }

  if (phase === 'rating') {
    return (
      <Screen edges={[]} testID="mock-rating">
        <RouterStack.Screen options={{ title: t('mock.selfAssessment') }} />
        <Text tone="muted">{t('mock.ratingIntro')}</Text>
        {drafts.map((d, i) => {
          const q = questions.find((x) => x.id === d.questionId);
          return (
            <Card key={d.questionId}>
              <Stack gap={2}>
                <Text variant="subheading">{q?.question}</Text>
                <Text variant="bodySmall" tone={d.skipped || !d.answer.trim() ? 'subtle' : 'default'}>
                  {d.skipped || !d.answer.trim() ? t('mock.skipped') : d.answer}
                </Text>
                {q ? (
                  <Button label={t('mock.compareModel')} variant="ghost" icon="book-outline" onPress={() => router.push({ pathname: '/question/[id]', params: { id: q.id } })} />
                ) : null}
                {RATING_CRITERIA.map((c) => (
                  <StarRating key={c} label={t(`mock.criteria.${c}`)} value={d.rating[c]} onChange={(v) => update({ rating: { ...d.rating, [c]: v } }, i)} testID={`rate-${i}-${c}`} />
                ))}
                <Text variant="caption" tone="muted">
                  {averageRating(d.rating) !== null ? t('mock.answerScore', { score: averageRating(d.rating) }) : t('mock.notRated')}
                </Text>
              </Stack>
            </Card>
          );
        })}
        <Button label={t('mock.saveAssessment')} size="lg" onPress={finish} testID="mock-finish" />
      </Screen>
    );
  }

  if (!summary) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="alert-circle-outline" title={t('mock.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} testID="mock-summary">
      <RouterStack.Screen options={{ title: t('mock.summaryTitle') }} />
      <Card tone="primary">
        <Stack gap={2}>
          <Text variant="display" center>
            {summary.averageScore !== null ? `${summary.averageScore}/5` : '-'}
          </Text>
          <Text center tone="muted">
            {t('mock.selfScoreLabel')}
          </Text>
        </Stack>
      </Card>
      <Text>{t('mock.answeredOf', { answered: summary.answered, total: summary.total })}</Text>
      {summary.weakest ? (
        <>
          <SectionHeader title={t('mock.nextFocus')} />
          <Text>{t(`mock.advice.${summary.weakest}`)}</Text>
        </>
      ) : null}
      <Text variant="caption" tone="subtle">
        {t('mock.transparency')}
      </Text>
      <Button label={t('mock.newSession')} onPress={() => router.replace('/mock')} />
      <Button label={t('practice.builder.title')} variant="secondary" onPress={() => router.push('/builder')} />
      <Button label={t('common.done')} variant="ghost" onPress={() => router.dismissAll()} />
    </Screen>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>, minHeight: number) {
  return {
    minHeight,
    color: theme.colors.text,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: 12,
    textAlignVertical: 'top' as const,
    fontSize: 16,
  };
}
