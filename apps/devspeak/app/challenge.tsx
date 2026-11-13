import { dayIndex } from '@factory/app-core';
import { Badge, Button, Card, CodeLabel, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HelperTranslation, InlineTranslation, SectionTitle, SpeakButton } from '@/components/learning';
import { QuizRunner } from '@/components/QuizRunner';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useSession } from '@/store/session';

export default function DailyChallengeScreen() {
  const { t } = useTranslation();
  const [answered, setAnswered] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const { data } = useAsync(async () => {
    const now = clock.now();
    const challenge = await repos().content.getDailyChallenge(dayIndex(clock.today()));
    const word = challenge ? await repos().content.getWord(challenge.techWordId) : null;
    return { challenge, word, done: await repos().progress.isDailyChallengeDone(now) };
  }, []);

  const complete = async () => {
    if (!data?.challenge) return;
    try {
      const res = await repos().progress.completeDailyChallenge(data.challenge.id, clock.now());
      setXp(res.xpEarned);
      if (!res.alreadyDone) track('daily_challenge_completed', { challenge_id: data.challenge.id });
      useSession.getState().bump();
    } catch (e) {
      recordError(e, 'challenge_complete');
    }
  };

  if (data && !data.challenge) return <EmptyState icon="alert-circle-outline" title={t('common.error')} />;
  const c = data?.challenge;
  if (!c) return null;
  const done = data.done || xp !== null;

  return (
    <>
      <RouterStack.Screen options={{ title: t('challenge.title') }} />
      <Screen edges={[]}>
        <Card tone="primary">
          <CodeLabel tone="primary">{t('challenge.objective')}</CodeLabel>
          <Text variant="subheading">{c.objective}</Text>
          <HelperTranslation value={c.objectiveTranslation} />
        </Card>

        <SectionTitle icon="chatbox-ellipses-outline" title={t('challenge.expression')} />
        <Card>
          <Row style={{ alignItems: 'flex-start' }}>
            <Text variant="heading" style={{ flex: 1 }}>
              “{c.expression.phrase}”
            </Text>
            <SpeakButton text={c.expression.phrase} />
          </Row>
          <Text variant="bodySmall" tone="muted">
            {c.expression.usage}
          </Text>
          <HelperTranslation value={c.expression.translation} />
        </Card>

        {data.word ? (
          <>
            <SectionTitle icon="code-slash-outline" title={t('challenge.techWord')} />
            <Card>
              <Row>
                <Text variant="heading" style={{ flex: 1 }}>
                  {data.word.term}
                </Text>
                <SpeakButton text={data.word.term} />
              </Row>
              <Text variant="bodySmall">{data.word.definition}</Text>
              <InlineTranslation value={data.word.translation} />
              <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
                {data.word.example}
              </Text>
            </Card>
          </>
        ) : null}

        <SectionTitle icon="people-outline" title={t('challenge.dialogue')} />
        <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
          {c.dialogue.context}
        </Text>
        {c.dialogue.lines.map((l, i) => (
          <Card key={i} tone={i % 2 ? 'primary' : 'default'}>
            <Row style={{ alignItems: 'flex-start' }}>
              <Stack gap={1} style={{ flex: 1 }}>
                <Text variant="caption" tone="accent" style={{ fontWeight: '800' }}>
                  {l.speaker}
                </Text>
                <Text>{l.text}</Text>
              </Stack>
              <SpeakButton text={l.text} />
            </Row>
            <HelperTranslation value={l.translation} />
          </Card>
        ))}

        <SectionTitle icon="help-circle-outline" title={t('challenge.quiz')} />
        {done ? (
          <Card tone="accent">
            <Text variant="subheading" accessibilityLiveRegion="polite">
              {xp ? t('challenge.completed', { count: xp }) : t('challenge.alreadyDone')}
            </Text>
          </Card>
        ) : answered ? (
          <Button label={t('challenge.complete')} icon="checkmark-circle-outline" onPress={complete} testID="challenge-complete" />
        ) : (
          <>
            <Badge label={t('challenge.answerFirst')} tone="neutral" />
            <QuizRunner questions={[c.quiz]} onFinish={() => setAnswered(true)} />
          </>
        )}
      </Screen>
    </>
  );
}
