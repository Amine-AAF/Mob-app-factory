import { seededShuffle } from '@factory/app-core';
import { Button, EmptyState, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, View } from 'react-native';

import { effectiveSrs } from '@/config/limits';
import { repos } from '@/database';
import type { Flashcard } from '@/database/repositories/flashcards';
import { previewIntervals, type FlashcardGrade } from '@/features/flashcards/scheduler';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterLearningWrite } from '@/services/progress';
import { READING_SCALE, usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

const GRADES: { grade: FlashcardGrade; tone: 'danger' | 'warning' | 'primary' | 'success' }[] = [
  { grade: 'again', tone: 'danger' },
  { grade: 'hard', tone: 'warning' },
  { grade: 'medium', tone: 'primary' },
  { grade: 'easy', tone: 'success' },
];

/** Review session: front → flip → grade. No ads are ever shown here. */
export default function Review() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const prefs = usePreferences();
  const scale = READING_SCALE[prefs.readingSize];
  const params = useLocalSearchParams<{ subjectId?: string; mode?: string }>();
  const cram = params.mode === 'cram' && isPremium;
  const [queue, setQueue] = useState<Flashcard[] | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<Record<FlashcardGrade, number>>({ again: 0, hard: 0, medium: 0, easy: 0 });
  const shownAt = useRef(0);
  const [flip] = useState(() => new Animated.Value(0));
  const srs = effectiveSrs(prefs.srs, isPremium);

  useEffect(() => {
    const q = { subjectId: params.subjectId || null };
    const load = cram
      ? repos().flashcards.list(q).then((all) => seededShuffle(all, Date.now()).slice(0, 50))
      : repos().flashcards.dueCards(q, { newCards: srs.newCardsPerDay, reviews: srs.maxReviewsPerDay });
    void load.then((cards) => {
      shownAt.current = Date.now();
      setQueue(cards);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per session
  }, []);

  const card = queue?.[index];
  const reviewed = Object.values(counts).reduce((a, b) => a + b, 0);

  const showBack = () => {
    setFlipped(true);
    Animated.spring(flip, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  };

  const grade = async (g: FlashcardGrade) => {
    if (!card || !queue) return;
    if (prefs.hapticsEnabled) void Haptics.selectionAsync();
    // Cram mode practises without changing the schedule.
    if (!cram) await repos().flashcards.review(card.id, g, { intervalModifier: srs.intervalModifier }, clock.now().getTime() - shownAt.current);
    setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
    // A forgotten card comes back at the end of today's session once.
    if (g === 'again' && !cram && !queue.slice(index + 1).some((c) => c.id === card.id)) setQueue([...queue, card]);
    setIndex((i) => i + 1);
    setFlipped(false);
    flip.setValue(0);
    shownAt.current = clock.now().getTime();
  };

  useEffect(() => {
    if (queue && index >= queue.length && reviewed > 0) {
      track('flashcards_reviewed', { count: reviewed });
      void afterLearningWrite(repos());
    }
  }, [queue, index, reviewed]);

  if (!queue) return <Screen edges={[]}>{null}</Screen>;
  if (queue.length === 0)
    return (
      <Screen edges={[]}>
        <EmptyState icon="checkmark-done-circle-outline" title={t('flashcards.nothingDue')} message={t('flashcards.nothingDueBody')} action={<Button label={t('common.done')} onPress={() => router.back()} />} />
      </Screen>
    );

  if (!card)
    return (
      <Screen edges={[]} testID="review-summary">
        <Stack gap={4} style={{ paddingTop: 24 }}>
          <Text variant="display" center>
            {t('flashcards.sessionDone')}
          </Text>
          <Text center tone="muted">
            {t('flashcards.reviewedCount', { count: reviewed })}
          </Text>
          <Row gap={2} style={{ justifyContent: 'center' }}>
            {GRADES.map((g) => (
              <View key={g.grade} style={{ alignItems: 'center', minWidth: 70 }}>
                <Text variant="title" tone={g.tone}>
                  {counts[g.grade]}
                </Text>
                <Text variant="caption" tone="subtle">
                  {t(`flashcards.grades.${g.grade}`)}
                </Text>
              </View>
            ))}
          </Row>
          {cram ? (
            <Text variant="bodySmall" tone="muted" center>
              {t('flashcards.cramNote')}
            </Text>
          ) : null}
          <Button label={t('common.done')} onPress={() => router.back()} testID="review-done" />
        </Stack>
      </Screen>
    );

  const intervals = previewIntervals({ repetitions: card.repetitions, intervalDays: card.intervalDays, ease: card.ease, dueDay: card.dueDay, lapses: card.lapses }, clock.today(), { intervalModifier: srs.intervalModifier });
  const rotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotateBack = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const face = { position: 'absolute' as const, inset: 0, backfaceVisibility: 'hidden' as const, borderRadius: theme.radius.xl, padding: 24, justifyContent: 'center' as const, borderWidth: 1, borderColor: theme.colors.border };

  return (
    <Screen
      edges={['bottom']}
      scroll={false}
      footer={
        flipped ? (
          <Row gap={2}>
            {GRADES.map((g) => (
              <Pressable
                key={g.grade}
                onPress={() => grade(g.grade)}
                accessibilityRole="button"
                accessibilityLabel={`${t(`flashcards.grades.${g.grade}`)}, ${t('flashcards.inDays', { count: intervals[g.grade] })}`}
                testID={`grade-${g.grade}`}
                style={({ pressed }) => ({ flex: 1, minHeight: 60, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border })}
              >
                <Text variant="bodySmall" tone={g.tone} style={{ fontWeight: '700' }}>
                  {t(`flashcards.grades.${g.grade}`)}
                </Text>
                {!cram ? (
                  <Text variant="caption" tone="subtle">
                    {t('flashcards.inDays', { count: intervals[g.grade] })}
                  </Text>
                ) : null}
              </Pressable>
            ))}
          </Row>
        ) : (
          <Button label={t('flashcards.showAnswer')} onPress={showBack} testID="show-answer" />
        )
      }
    >
      <ProgressBar progress={index / queue.length} label={t('flashcards.progress', { current: index + 1, total: queue.length })} />
      <Text variant="caption" tone="subtle" center>
        {t('flashcards.progress', { current: index + 1, total: queue.length })}
        {cram ? ` · ${t('flashcards.cram')}` : ''}
      </Text>
      <Pressable style={{ flex: 1 }} onPress={flipped ? undefined : showBack} accessibilityRole="button" accessibilityLabel={flipped ? card.back : `${card.front}. ${t('flashcards.tapToFlip')}`}>
        <Animated.View style={[face, { backgroundColor: theme.colors.surface, transform: [{ perspective: 1000 }, { rotateY: rotate }] }]}>
          <Text variant="label" tone="subtle" center>
            {t('flashcards.question')}
          </Text>
          <Text center style={{ fontSize: 22 * scale, lineHeight: 32 * scale, fontWeight: '600', marginTop: 12 }} testID="card-front-text">
            {card.front}
          </Text>
          <Text variant="caption" tone="subtle" center style={{ marginTop: 24 }}>
            {t('flashcards.tapToFlip')}
          </Text>
        </Animated.View>
        <Animated.View style={[face, { backgroundColor: theme.colors.primarySoft, transform: [{ perspective: 1000 }, { rotateY: rotateBack }] }]}>
          <Text variant="label" tone="subtle" center>
            {t('flashcards.answer')}
          </Text>
          <Text center style={{ fontSize: 20 * scale, lineHeight: 30 * scale, marginTop: 12 }}>
            {card.back}
          </Text>
          <Text variant="caption" tone="muted" center style={{ marginTop: 16 }}>
            {card.front}
          </Text>
        </Animated.View>
      </Pressable>
    </Screen>
  );
}
