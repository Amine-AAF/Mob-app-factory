import type { ReviewGrade } from '@factory/app-core';
import { Button, Card, Chip, EmptyState, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable } from 'react-native';

import { InlineTranslation, SpeakButton } from '@/components/learning';
import type { VocabularyEntry } from '@/content';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useIsPremium, useSession } from '@/store/session';

type Deck = 'all' | 'favorites';

export default function Flashcards() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const [deck, setDeck] = useState<Deck>('all');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [flip] = useState(() => new Animated.Value(0));

  // Session queue is computed once per deck (not on every progress bump) so cards don't jump.
  const [queue, setQueue] = useState<VocabularyEntry[] | null>(null);
  const { data: freeCount } = useAsync(async () => (await repos().content.listWords(false)).length, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      const words = await repos().content.listWords(isPremium);
      const favorites = await repos().progress.favoriteIds();
      const pool = deck === 'favorites' && isPremium ? words.filter((w) => favorites.has(w.id)) : words;
      const ids = await repos().progress.flashcardQueue(pool.map((w) => w.id), clock.now(), 20);
      const byId = new Map(pool.map((w) => [w.id, w]));
      if (alive) {
        setQueue(ids.map((id) => byId.get(id)).filter((w): w is VocabularyEntry => !!w));
        setIndex(0);
        setReviewed(0);
      }
    })().catch((e) => recordError(e, 'flashcards_queue'));
    return () => {
      alive = false;
    };
  }, [deck, isPremium]);

  useEffect(() => {
    Animated.spring(flip, { toValue: flipped ? 1 : 0, useNativeDriver: true, friction: 8 }).start();
  }, [flipped, flip]);

  const card = queue?.[index];

  const grade = async (g: ReviewGrade) => {
    if (!card) return;
    try {
      await repos().progress.reviewFlashcard(card.id, g, clock.now());
    } catch (e) {
      recordError(e, 'flashcard_review');
    }
    setReviewed((r) => r + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
    useSession.getState().bump();
  };

  const rotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotateBack = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <>
      <RouterStack.Screen options={{ title: t('flashcards.title') }} />
      <Screen edges={[]} scroll={false}>
        <Row gap={2}>
          <Chip label={t('flashcards.deckAll')} selected={deck === 'all'} onPress={() => setDeck('all')} />
          <Chip
            label={t('flashcards.deckFavorites')}
            selected={deck === 'favorites'}
            icon={isPremium ? 'bookmark' : 'lock-closed'}
            onPress={() => (isPremium ? setDeck('favorites') : router.push({ pathname: '/paywall', params: { source: 'flashcards_deck' } }))}
          />
        </Row>
        {!isPremium && freeCount ? (
          <Text variant="caption" tone="muted">
            {t('flashcards.freeLimit', { count: freeCount })}
          </Text>
        ) : null}

        {!queue ? null : !card ? (
          <EmptyState
            icon={reviewed > 0 ? 'checkmark-done-circle-outline' : 'cafe-outline'}
            title={reviewed > 0 ? t('flashcards.sessionDone') : t('flashcards.nothingDue')}
            message={reviewed > 0 ? t('flashcards.sessionDoneBody', { count: reviewed }) : t('flashcards.nothingDueBody')}
            action={<Button label={t('common.done')} onPress={() => router.back()} />}
          />
        ) : (
          <Stack gap={4} style={{ flex: 1 }}>
            <Stack gap={2}>
              <Text variant="caption" tone="muted">
                {t('flashcards.remaining', { count: queue.length - index })}
              </Text>
              <ProgressBar progress={index / queue.length} tone="accent" />
            </Stack>
            <Pressable
              onPress={() => setFlipped((f) => !f)}
              accessibilityRole="button"
              accessibilityLabel={flipped ? `${card.term}: ${card.definition}` : `${card.term}. ${t('flashcards.tapToFlip')}`}
              style={{ flex: 1, minHeight: 280 }}
              testID="flashcard"
            >
              <Animated.View style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: [{ perspective: 1000 }, { rotateY: rotate }] }}>
                <Card style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                  <Text variant="display" center>
                    {card.term}
                  </Text>
                  <SpeakButton text={card.term} size={28} />
                  <Text variant="caption" tone="subtle">
                    {t('flashcards.tapToFlip')}
                  </Text>
                </Card>
              </Animated.View>
              <Animated.View style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: [{ perspective: 1000 }, { rotateY: rotateBack }] }}>
                <Card tone="primary" style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
                  <Text variant="heading">{card.term}</Text>
                  <Text>{card.definition}</Text>
                  <InlineTranslation value={card.translation} />
                  <Text variant="bodySmall" tone="muted" style={{ fontStyle: 'italic' }}>
                    {card.example}
                  </Text>
                </Card>
              </Animated.View>
            </Pressable>
            {flipped ? (
              <Row gap={2}>
                {(
                  [
                    [0, 'again', 'danger'],
                    [1, 'hard', 'secondary'],
                    [2, 'good', 'primary'],
                    [3, 'easy', 'accent'],
                  ] as const
                ).map(([g, key, variant]) => (
                  <Stack key={key} style={{ flex: 1 }}>
                    <Button label={t(`flashcards.${key}`)} variant={variant} size="md" onPress={() => grade(g)} testID={`grade-${key}`} />
                  </Stack>
                ))}
              </Row>
            ) : (
              <Button label={t('flashcards.showAnswer')} variant="secondary" onPress={() => setFlipped(true)} testID="show-answer" />
            )}
            <Text variant="caption" tone="subtle" center style={{ color: theme.colors.textSubtle }}>
              {index + 1} / {queue.length}
            </Text>
          </Stack>
        )}
      </Screen>
    </>
  );
}
