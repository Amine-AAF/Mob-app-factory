import { Badge, Button, Card, CodeLabel, Divider, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { HelperTranslation, InlineTranslation, LevelBadge, SectionTitle, SpeakButton } from '@/components/learning';
import { repos } from '@/database';
import { canAccessLesson } from '@/features/learning/recommendations';
import { useAsync } from '@/hooks/useAsync';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { speak, stopSpeaking } from '@/services/speech';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const rate = usePreferences((s) => s.speechRate);
  const [playingLine, setPlayingLine] = useState<number | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const { data, loading } = useAsync(async () => {
    const [lesson, statuses, total] = await Promise.all([repos().content.getLesson(id), repos().progress.lessonStatuses(), repos().content.countContent()]);
    return { lesson, status: statuses.get(id), total: total.lessons };
  }, [id]);

  const lesson = data?.lesson;
  const allowed = lesson ? canAccessLesson(lesson, isPremium) : false;

  useEffect(() => {
    if (!lesson || !allowed) return;
    repos()
      .progress.startLesson(lesson.id, clock.now())
      .catch(() => undefined);
    track('lesson_started', { lesson_id: lesson.id, module: lesson.moduleId });
  }, [lesson, allowed]);

  useEffect(() => () => stopSpeaking(), []);

  /** Plays the dialogue line by line with TTS, highlighting the current line. */
  const playFrom = (i: number) => {
    const line = lesson?.dialogue.lines[i];
    if (!line) {
      setPlayingLine(null);
      return;
    }
    setPlayingLine(i);
    speak(line.text, { rate, onDone: () => playFrom(i + 1), onError: () => setPlayingLine(null) });
  };

  if (!loading && !lesson) return <EmptyState icon="alert-circle-outline" title={t('lesson.notFound')} />;
  if (!lesson) return null;

  if (!allowed) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: '' }} />
        <EmptyState
          icon="diamond-outline"
          title={t('lesson.lockedTitle')}
          message={t('lesson.lockedBody', { count: data?.total ?? 0 })}
          action={<Button label={t('paywall.subscribe')} onPress={() => router.replace({ pathname: '/paywall', params: { source: 'lesson_locked' } })} />}
        />
      </Screen>
    );
  }

  const done = data?.status?.status === 'completed';
  return (
    <>
      <RouterStack.Screen options={{ title: t(`modules.${lesson.moduleId}`) }} />
      <Screen
        edges={[]}
        footer={
          <Button
            label={done ? t('lesson.retakeQuiz') : t('lesson.startQuiz')}
            icon="help-circle-outline"
            onPress={() => {
              stopSpeaking();
              router.push(`/quiz/${lesson.id}`);
            }}
            testID="start-quiz"
          />
        }
      >
        <Stack gap={2}>
          <Row gap={2} wrap>
            <LevelBadge level={lesson.level} />
            <Badge label={t('common.minutes', { count: lesson.minutes })} tone="neutral" icon="time-outline" />
            {done ? <Badge label={t('lesson.completed', { score: data?.status?.bestScore ?? 0 })} tone="success" icon="checkmark" /> : null}
          </Row>
          <Text variant="title" accessibilityRole="header">
            {lesson.title}
          </Text>
          <HelperTranslation value={lesson.titleTranslation} />
        </Stack>

        <Card tone="primary">
          <CodeLabel tone="primary">{t('lesson.objective')}</CodeLabel>
          <Text variant="subheading">{lesson.objective}</Text>
          <HelperTranslation value={lesson.objectiveTranslation} />
        </Card>

        <SectionTitle icon="map-outline" title={t('lesson.situation')} />
        <Text>{lesson.situation}</Text>
        <HelperTranslation value={lesson.situationTranslation} />

        {lesson.interview ? (
          <>
            <SectionTitle icon="mic-outline" title={t('lesson.interviewQuestion')} />
            <Card tone="accent">
              <Row style={{ alignItems: 'flex-start' }}>
                <Text variant="heading" style={{ flex: 1 }}>
                  “{lesson.interview.question}”
                </Text>
                <SpeakButton text={lesson.interview.question} />
              </Row>
              <HelperTranslation value={lesson.interview.questionTranslation} />
            </Card>
            <Text variant="subheading">{t('lesson.whyAsked')}</Text>
            <Text tone="muted">{lesson.interview.explanation}</Text>
            <HelperTranslation value={lesson.interview.explanationTranslation} />
          </>
        ) : null}

        <SectionTitle icon="key-outline" title={t('lesson.vocabulary')} />
        <Card style={{ gap: 0, paddingVertical: 4 }}>
          {lesson.vocabulary.map((v, i) => (
            <View key={v.term}>
              {i > 0 ? <Divider /> : null}
              <Row style={{ paddingVertical: 10, alignItems: 'flex-start' }}>
                <Stack gap={1} style={{ flex: 1 }}>
                  <Text variant="subheading">{v.term}</Text>
                  <Text variant="bodySmall" tone="muted">
                    {v.definition}
                  </Text>
                  <InlineTranslation value={v.translation} />
                </Stack>
                <SpeakButton text={v.term} label={t('vocabulary.pronounce', { word: v.term })} />
              </Row>
            </View>
          ))}
        </Card>

        <SectionTitle icon="chatbox-ellipses-outline" title={t('lesson.expressions')} />
        {lesson.expressions.map((e) => (
          <Card key={e.phrase}>
            <Row style={{ alignItems: 'flex-start' }}>
              <Text variant="subheading" style={{ flex: 1 }}>
                “{e.phrase}”
              </Text>
              <SpeakButton text={e.phrase} />
            </Row>
            <Text variant="bodySmall" tone="muted">
              {e.usage}
            </Text>
            <HelperTranslation value={e.translation} />
          </Card>
        ))}

        <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <SectionTitle icon="people-outline" title={t('lesson.dialogue')} />
          <Button
            label={playingLine !== null ? t('common.stop') : t('lesson.playDialogue')}
            icon={playingLine !== null ? 'stop' : 'play'}
            variant="secondary"
            size="md"
            onPress={() => {
              if (playingLine !== null) {
                stopSpeaking();
                setPlayingLine(null);
              } else playFrom(0);
            }}
          />
        </Row>
        <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
          {lesson.dialogue.context}
        </Text>
        <Stack gap={2}>
          {lesson.dialogue.lines.map((line, i) => {
            const speakers = [...new Set(lesson.dialogue.lines.map((l) => l.speaker))];
            const right = speakers.indexOf(line.speaker) % 2 === 1;
            const active = playingLine === i;
            return (
              <View key={i} style={{ alignItems: right ? 'flex-end' : 'flex-start' }}>
                <View
                  style={{
                    maxWidth: '88%',
                    padding: 12,
                    gap: 4,
                    borderRadius: 16,
                    borderBottomLeftRadius: right ? 16 : 4,
                    borderBottomRightRadius: right ? 4 : 16,
                    backgroundColor: right ? theme.colors.primarySoft : theme.colors.surface,
                    borderWidth: 1.5,
                    borderColor: active ? theme.colors.accent : right ? 'transparent' : theme.colors.border,
                  }}
                >
                  <Text variant="caption" tone={right ? 'primary' : 'accent'} style={{ fontWeight: '800' }}>
                    {line.speaker}
                  </Text>
                  <Pressable onPress={() => speak(line.text, { rate })} accessibilityRole="button" accessibilityHint={t('common.listen')}>
                    <Text>{line.text}</Text>
                  </Pressable>
                  <HelperTranslation value={line.translation} />
                </View>
              </View>
            );
          })}
        </Stack>

        {lesson.interview ? (
          <>
            <SectionTitle icon="document-text-outline" title={t('lesson.exampleAnswer')} />
            <Card>
              <Row style={{ alignItems: 'flex-start' }}>
                <Text style={{ flex: 1 }}>{lesson.interview.exampleAnswer}</Text>
                <SpeakButton text={lesson.interview.exampleAnswer} />
              </Row>
              <HelperTranslation value={lesson.interview.exampleAnswerTranslation} />
              <Row gap={2} style={{ marginTop: 4 }}>
                <Icon name="information-circle-outline" size={16} color={theme.colors.textMuted} />
                <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                  {t('lesson.answerDisclaimer')}
                </Text>
              </Row>
            </Card>
            <Text variant="subheading">{t('lesson.alternatives')}</Text>
            {lesson.interview.alternatives.map((a) => (
              <Row key={a} style={{ alignItems: 'flex-start' }} gap={2}>
                <Icon name="swap-horizontal-outline" size={16} color={theme.colors.accent} />
                <Text variant="bodySmall" style={{ flex: 1 }}>
                  {a}
                </Text>
              </Row>
            ))}
            <SectionTitle icon="barbell-outline" title={t('lesson.practice')} />
            <Card tone="alt">
              <Text>{lesson.interview.practice}</Text>
              <Button label={t('lesson.practiceSpeaking')} variant="secondary" icon="mic-outline" size="md" onPress={() => router.push({ pathname: '/speaking/[mode]', params: { mode: 'interview', lessonId: lesson.id } })} />
            </Card>
            <Text variant="subheading">{t('lesson.selfAssessment')}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('lesson.selfAssessmentHint')}
            </Text>
            {lesson.interview.selfAssessment.map((item, i) => {
              const on = checked.has(i);
              return (
                <Pressable
                  key={item}
                  onPress={() => setChecked((s) => (s.has(i) ? new Set([...s].filter((x) => x !== i)) : new Set([...s, i])))}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 4 }}
                >
                  <Icon name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? theme.colors.success : theme.colors.textSubtle} />
                  <Text variant="bodySmall" style={{ flex: 1 }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </>
        ) : null}
      </Screen>
    </>
  );
}
