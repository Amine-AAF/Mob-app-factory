import type { ReviewGrade } from '@factory/app-core';
import { Button, Chip, EmptyState, ProgressBar, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { Flashcard } from '@/components/practice';
import { repos } from '@/database';
import { buildDeck, FLASHCARD_GRADES, toFlashcard } from '@/features/flashcards/deck';
import { useQuestions } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { gradeFlashcard } from '@/services/practice';
import { useIsPremium } from '@/store/session';
import { CATEGORIES, type CategoryId, type Question } from '@/types/content';

const DECK_SIZE = 15;
const GRADE_KEYS: Record<ReviewGrade, 'again' | 'hard' | 'good' | 'easy'> = { 0: 'again', 1: 'hard', 2: 'good', 3: 'easy' };

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const questions = useQuestions();
  const isPremium = useIsPremium();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [deck, setDeck] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const start = async () => {
    const cards = await repos().review.getCards('question');
    setDeck(buildDeck({ questions, cards, today: clock.today(), category, includePremium: isPremium, size: DECK_SIZE, seed: Date.now() % 1_000_000 }));
    setIndex(0);
    setRevealed(false);
  };

  const grade = async (g: ReviewGrade) => {
    const card = deck?.[index];
    if (!card) return;
    try {
      await gradeFlashcard(card.id, g);
    } catch (e) {
      recordError(e, 'flashcard_grade');
    }
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (!deck) {
    return (
      <Screen edges={[]} testID="flashcards-setup">
        <RouterStack.Screen options={{ title: t('practice.flashcards.title') }} />
        <Text tone="muted">{t('flashcards.intro', { count: DECK_SIZE })}</Text>
        <ScrollView>
          <Row wrap gap={2}>
            <Chip label={t('common.all')} selected={category === null} onPress={() => setCategory(null)} />
            {CATEGORIES.map((c) => (
              <Chip key={c} label={t(`categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </Row>
        </ScrollView>
        <Button label={t('common.start')} size="lg" onPress={() => start().catch((e) => recordError(e, 'flashcards_start'))} testID="flashcards-start" />
      </Screen>
    );
  }

  const card = deck[index];
  if (!card) {
    return (
      <Screen edges={[]} testID="flashcards-done">
        <RouterStack.Screen options={{ title: t('practice.flashcards.title') }} />
        <EmptyState
          icon="checkmark-done-outline"
          title={deck.length ? t('flashcards.doneTitle') : t('flashcards.empty')}
          message={deck.length ? t('flashcards.doneBody', { count: deck.length }) : undefined}
          action={
            <Stack gap={2}>
              <Button label={t('flashcards.again')} onPress={() => setDeck(null)} />
              <Button label={t('common.done')} variant="ghost" onPress={() => router.back()} />
            </Stack>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen edges={[]} testID="flashcards-session">
      <RouterStack.Screen options={{ title: t('practice.flashcards.title') }} />
      <ProgressBar progress={index / deck.length} label={t('flashcards.progress', { current: index + 1, total: deck.length })} />
      <Text variant="caption" tone="muted">
        {t('flashcards.progress', { current: index + 1, total: deck.length })} · {t(`categories.${card.category}`)}
      </Text>
      <Flashcard card={toFlashcard(card)} revealed={revealed} onReveal={() => setRevealed(true)} />
      {revealed ? (
        <Stack gap={2}>
          <Text variant="caption" tone="muted" center>
            {t('flashcards.howWell')}
          </Text>
          <Row gap={2} wrap style={{ justifyContent: 'center' }}>
            {FLASHCARD_GRADES.map((g) => (
              <Button key={g} label={t(`flashcards.grade.${GRADE_KEYS[g]}`)} variant={g === 0 ? 'danger' : g === 3 ? 'accent' : 'secondary'} onPress={() => grade(g)} testID={`grade-${g}`} />
            ))}
          </Row>
          <Button label={t('flashcards.openQuestion')} variant="ghost" icon="book-outline" onPress={() => router.push({ pathname: '/question/[id]', params: { id: card.id } })} />
        </Stack>
      ) : (
        <Button label={t('flashcards.reveal')} size="lg" onPress={() => setRevealed(true)} testID="flashcard-reveal" />
      )}
    </Screen>
  );
}
