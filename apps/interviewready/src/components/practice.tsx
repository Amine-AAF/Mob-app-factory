import { Card, Icon, PressableScale, Row, Stack, Text, useTheme } from '@factory/design-system';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import type { FlashcardContent } from '@/features/flashcards/deck';

/** 1-to-5 rating used by the mock interview self-assessment grid. */
export function StarRating({ value, onChange, label, testID }: { value: number | undefined; onChange: (v: number) => void; label: string; testID?: string }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack gap={1}>
      <Text variant="bodySmall">{label}</Text>
      <Row gap={1} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min: 1, max: 5, now: value ?? 0 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('mock.starLabel', { count: n })}
            accessibilityState={{ selected: (value ?? 0) >= n }}
            testID={testID ? `${testID}-${n}` : undefined}
            style={{ padding: 4 }}
          >
            <Icon name={(value ?? 0) >= n ? 'star' : 'star-outline'} size={28} color={(value ?? 0) >= n ? theme.colors.warning : theme.colors.textSubtle} />
          </Pressable>
        ))}
      </Row>
    </Stack>
  );
}

/** Two-sided card: tap to reveal the answer, then grade your recall. */
export function Flashcard({ card, revealed, onReveal }: { card: FlashcardContent; revealed: boolean; onReveal: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <PressableScale onPress={onReveal} accessibilityRole="button" accessibilityLabel={revealed ? card.back : t('flashcards.reveal')} testID="flashcard">
      <Card tone={revealed ? 'alt' : 'primary'} style={{ minHeight: 260, justifyContent: 'center' }}>
        <Stack gap={3}>
          <Text variant="label" tone="primary">
            {revealed ? t('flashcards.answer') : t('flashcards.question')}
          </Text>
          <Text variant={revealed ? 'body' : 'heading'}>{revealed ? card.back : card.front}</Text>
          {revealed && card.keyPoints.length ? (
            <Stack gap={1}>
              {card.keyPoints.map((p, i) => (
                <Row key={i} gap={2} style={{ alignItems: 'flex-start' }}>
                  <Icon name="checkmark" size={16} color={theme.colors.success} />
                  <Text variant="bodySmall" style={{ flex: 1 }}>
                    {p}
                  </Text>
                </Row>
              ))}
            </Stack>
          ) : null}
          {!revealed ? (
            <Text variant="caption" tone="muted">
              {t('flashcards.tapToReveal')}
            </Text>
          ) : null}
        </Stack>
      </Card>
    </PressableScale>
  );
}

/**
 * Shared frame of a mock interview question: progress, optional timer and the question.
 * Ads are never shown inside this component's screens.
 */
export function MockInterviewScreen({
  index,
  total,
  question,
  secondsLeft,
  children,
}: {
  index: number;
  total: number;
  question: string;
  secondsLeft: number | null;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const overtime = secondsLeft !== null && secondsLeft < 0;
  return (
    <Stack gap={3}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {t('mock.progress', { current: index + 1, total })}
        </Text>
        {secondsLeft !== null ? (
          <Row gap={1} accessibilityLiveRegion="polite">
            <Icon name="timer-outline" size={16} color={overtime ? theme.colors.danger : theme.colors.textMuted} />
            <Text variant="caption" tone={overtime ? 'danger' : 'muted'} testID="mock-timer">
              {formatTimer(secondsLeft)}
            </Text>
          </Row>
        ) : null}
      </Row>
      <Text variant="title" accessibilityRole="header">
        {question}
      </Text>
      {children}
    </Stack>
  );
}

export function formatTimer(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(seconds);
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}`;
}

/** Small hook for the flashcard reveal state. */
export function useReveal(): [boolean, () => void, () => void] {
  const [revealed, setRevealed] = useState(false);
  return [revealed, () => setRevealed(true), () => setRevealed(false)];
}
