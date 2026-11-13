import { Badge, Button, Card, CodeLabel, EmptyState, Icon, OptionCard, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { HelperTranslation, SpeakButton } from '@/components/learning';
import { QuizRunner } from '@/components/QuizRunner';
import { Recorder } from '@/components/Recorder';
import { lessons as allLessons } from '@/content';
import { repos } from '@/database';
import { buildExercise, PRACTICE_MODES, type Exercise, type PracticeMode } from '@/features/practice/exercises';
import { remainingPractice } from '@/features/practice/limits';
import { canAccessLesson } from '@/features/learning/recommendations';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { speak, stopSpeaking } from '@/services/speech';
import { usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';

export default function SpeakingScreen() {
  const { mode: rawMode, lessonId } = useLocalSearchParams<{ mode: string; lessonId?: string }>();
  const mode = (PRACTICE_MODES as string[]).includes(rawMode) ? (rawMode as PracticeMode) : 'listening';
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const rate = usePreferences((s) => s.speechRate);
  const bonus = usePreferences((s) => s.bonusPractice);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const [finished, setFinished] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(Number.POSITIVE_INFINITY);

  const accessible = useMemo(() => allLessons.filter((l) => canAccessLesson(l, isPremium)), [isPremium]);
  const fills = useMemo(() => accessible.flatMap((l) => l.quiz.filter((q) => q.type === 'fill')), [accessible]);
  const exercise = useMemo(() => buildExercise(mode, accessible, fills, seed, lessonId), [mode, accessible, fills, seed, lessonId]);

  useEffect(() => {
    repos()
      .progress.speakingDoneOn(clock.now())
      .then((done) => setRemaining(remainingPractice({ isPremium, doneToday: done, bonus, today: clock.today() })))
      .catch(() => undefined);
  }, [isPremium, bonus, finished]);

  useEffect(() => () => stopSpeaking(), []);

  const complete = async () => {
    if (!exercise || finished !== null) return;
    try {
      const res = await repos().progress.recordSpeaking(exercise.id, clock.now());
      setFinished(res.xpEarned);
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'speaking_complete');
    }
  };

  const nextExercise = () => {
    if (remaining <= 0) {
      router.replace({ pathname: '/paywall', params: { source: 'practice_limit' } });
      return;
    }
    stopSpeaking();
    setFinished(null);
    setSeed((s) => s + 1);
  };

  const title = t(`practice.${mode}`);
  if (!exercise) return <EmptyState icon="alert-circle-outline" title={t('common.error')} />;

  return (
    <>
      <RouterStack.Screen options={{ title }} />
      <Screen
        edges={[]}
        footer={
          finished !== null ? (
            <Stack gap={2}>
              <Text variant="subheading" tone="success" center accessibilityLiveRegion="polite">
                {t('practice.exerciseDone', { count: finished })}
              </Text>
              <Row gap={2}>
                <Stack style={{ flex: 1 }}>
                  <Button label={t('practice.finish')} variant="secondary" onPress={() => router.back()} />
                </Stack>
                <Stack style={{ flex: 1 }}>
                  <Button label={t('practice.nextExercise')} onPress={nextExercise} testID="next-exercise" />
                </Stack>
              </Row>
            </Stack>
          ) : undefined
        }
      >
        <ExerciseView key={exercise.id + seed} exercise={exercise} rate={rate} onComplete={complete} done={finished !== null} />
        {mode !== 'listening' && mode !== 'completion' ? (
          <Row gap={2} style={{ alignItems: 'flex-start' }}>
            <Icon name="information-circle-outline" size={16} color={theme.colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('practice.honestNote')}
            </Text>
          </Row>
        ) : null}
      </Screen>
    </>
  );
}

function SelfRate({ onDone, disabled }: { onDone: () => void; disabled: boolean }) {
  const { t } = useTranslation();
  return (
    <Stack gap={2}>
      <Text variant="subheading">{t('practice.selfRate')}</Text>
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          <Button label={t('practice.selfRateRetry')} variant="secondary" size="md" onPress={onDone} disabled={disabled} />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <Button label={t('practice.selfRateGood')} size="md" onPress={onDone} disabled={disabled} testID="self-rate-good" />
        </Stack>
      </Row>
    </Stack>
  );
}

function ExerciseView({ exercise, rate, onComplete, done }: { exercise: Exercise; rate: number; onComplete: () => void; done: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [choice, setChoice] = useState<number | null>(null);
  const [showExample, setShowExample] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);

  switch (exercise.mode) {
    case 'listening':
      return (
        <Stack gap={4}>
          <Card tone="primary" style={{ alignItems: 'center', paddingVertical: 28 }}>
            <Button label={t('practice.playModel')} icon="volume-high" onPress={() => speak(exercise.audio, { rate })} testID="play-audio" />
            <Button label={t('practice.playModel') + ' · 0.7×'} variant="ghost" size="md" onPress={() => speak(exercise.audio, { rate: 0.7 })} />
          </Card>
          <Text variant="heading">{t('practice.whatDidYouHear')}</Text>
          {exercise.options.map((o, i) => (
            <OptionCard
              key={i}
              title={o}
              selected={choice === i}
              state={choice === null ? 'idle' : i === exercise.correctIndex ? 'correct' : i === choice ? 'wrong' : 'idle'}
              onPress={choice === null ? () => {
                setChoice(i);
                onComplete();
              } : undefined}
              testID={`listen-option-${i}`}
            />
          ))}
        </Stack>
      );

    case 'readAloud':
      return (
        <Stack gap={4}>
          <CodeLabel>{t('practice.readAloud')}</CodeLabel>
          <Card>
            <Text variant="heading">{exercise.text}</Text>
          </Card>
          <Button label={t('practice.playModel')} icon="volume-high" variant="secondary" onPress={() => speak(exercise.text, { rate })} />
          <Recorder />
          <SelfRate onDone={onComplete} disabled={done} />
        </Stack>
      );

    case 'completion':
      return <QuizRunner questions={[exercise.question]} onFinish={onComplete} />;

    case 'dialogue': {
      const lines = exercise.lesson.dialogue.lines;
      const speakers = [...new Set(lines.map((l) => l.speaker))];
      if (!role) {
        return (
          <Stack gap={3}>
            <Text variant="heading">{exercise.lesson.title}</Text>
            <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
              {exercise.lesson.dialogue.context}
            </Text>
            <Text variant="subheading">{t('practice.chooseRole')}</Text>
            {speakers.map((s) => (
              <OptionCard key={s} title={s} selected={false} icon="person-outline" onPress={() => setRole(s)} />
            ))}
          </Stack>
        );
      }
      const current = lines[lineIndex];
      const advance = () => {
        stopSpeaking();
        if (lineIndex + 1 >= lines.length) onComplete();
        setLineIndex((i) => Math.min(lines.length, i + 1));
      };
      return (
        <Stack gap={3}>
          {lines.slice(0, lineIndex).map((l, i) => (
            <Text key={i} variant="bodySmall" tone={l.speaker === role ? 'primary' : 'muted'}>
              <Text variant="bodySmall" style={{ fontWeight: '800' }}>
                {l.speaker}:{' '}
              </Text>
              {l.text}
            </Text>
          ))}
          {current ? (
            current.speaker === role ? (
              <Card tone="primary">
                <CodeLabel tone="primary">{t('practice.yourLine')}</CodeLabel>
                <Text variant="heading">{current.text}</Text>
                <HelperTranslation value={current.translation} />
                <Recorder />
                <Button label={t('common.next')} onPress={advance} testID="dialogue-next" />
              </Card>
            ) : (
              <Card>
                <Row>
                  <Text variant="caption" tone="accent" style={{ flex: 1, fontWeight: '800' }}>
                    {t('practice.theirLine', { speaker: current.speaker })}
                  </Text>
                  <SpeakButton text={current.text} />
                </Row>
                <Pressable onPress={() => speak(current.text, { rate })}>
                  <Text>{current.text}</Text>
                </Pressable>
                <Button label={t('common.next')} variant="secondary" onPress={advance} testID="dialogue-next" />
              </Card>
            )
          ) : (
            <Card tone="accent">
              <Text variant="subheading">{t('practice.dialogueDone')}</Text>
            </Card>
          )}
          <DialogueAutoPlay line={current && current.speaker !== role ? current.text : null} rate={rate} />
        </Stack>
      );
    }

    case 'interview':
      return (
        <Stack gap={4}>
          <Card tone="accent">
            <CodeLabel>{t('lesson.interviewQuestion')}</CodeLabel>
            <Row style={{ alignItems: 'flex-start' }}>
              <Text variant="heading" style={{ flex: 1 }}>
                “{exercise.question}”
              </Text>
              <SpeakButton text={exercise.question} />
            </Row>
          </Card>
          <Recorder />
          <Button label={t('practice.showExample')} variant="ghost" onPress={() => setShowExample((s) => !s)} />
          {showExample ? (
            <Card>
              <Text>{exercise.exampleAnswer}</Text>
              <Text variant="caption" tone="muted">
                {t('lesson.answerDisclaimer')}
              </Text>
            </Card>
          ) : null}
          <Text variant="subheading">{t('lesson.selfAssessment')}</Text>
          {exercise.selfAssessment.map((s) => (
            <Row key={s} gap={2} style={{ alignItems: 'flex-start' }}>
              <Icon name="checkmark-circle-outline" size={18} color={theme.colors.success} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {s}
              </Text>
            </Row>
          ))}
          <SelfRate onDone={onComplete} disabled={done} />
        </Stack>
      );

    case 'explain':
      return (
        <Stack gap={4}>
          <Card tone="primary">
            <CodeLabel tone="primary">{t('practice.explainPrompt')}</CodeLabel>
            <Text variant="heading">{exercise.prompt}</Text>
          </Card>
          <Text variant="subheading">{t('practice.includeWords')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {exercise.keywords.map((k) => (
              <Badge key={k} label={k} tone="accent" />
            ))}
          </View>
          <Recorder />
          <SelfRate onDone={onComplete} disabled={done} />
        </Stack>
      );
  }
}

/** Speaks the partner's line automatically when it appears. */
function DialogueAutoPlay({ line, rate }: { line: string | null; rate: number }) {
  useEffect(() => {
    if (line) speak(line, { rate });
  }, [line, rate]);
  return null;
}
