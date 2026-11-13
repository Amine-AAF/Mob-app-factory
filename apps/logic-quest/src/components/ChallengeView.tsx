import { Button, Card, Stack, Text, useTheme } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { Challenge, ChallengeText, PlayerAnswer, QuestionPhase, Translate } from '@/engine';
import { feedback } from '@/services/feedback';

import { PatternBoardView, PatternOptions, SequenceStrip } from './board';
import { ChoiceList, NumberKeypad } from './inputs';
import { MemoryPlay } from './MemoryPlay';

/**
 * Renders one challenge and collects the player's answer. It only *collects*:
 * validation happens in the engine (session.submitAnswer). The correct answer
 * is never rendered while `phase` is 'answering' or 'retry'.
 */
export function ChallengeView({
  challenge,
  text,
  ct,
  phase,
  lastAnswer,
  relaxed,
  replayToken,
  onSubmit,
}: {
  challenge: Challenge;
  text: ChallengeText;
  ct: Translate;
  phase: QuestionPhase;
  lastAnswer: PlayerAnswer | null;
  relaxed: boolean;
  replayToken: number;
  onSubmit: (a: PlayerAnswer) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const settled = phase === 'correct' || phase === 'failed';
  const interactive = phase === 'answering';
  const lastOption = lastAnswer?.kind === 'option' ? lastAnswer.index : null;
  const select = (i: number) => {
    feedback.tap();
    setSelected(i);
  };
  const submitOption = () => selected !== null && onSubmit({ kind: 'option', index: selected });
  const submitNumber = () => typed !== '' && typed !== '-' && onSubmit({ kind: 'number', value: Number(typed) });

  const submitButton = (onPress: () => void, disabled: boolean) => (interactive ? <Button label={t('game.submit')} onPress={onPress} disabled={disabled} testID="submit" /> : null);

  switch (challenge.category) {
    case 'sequence': {
      const correctIndex = settled && challenge.input === 'choice' ? challenge.options.indexOf(challenge.answer) : undefined;
      return (
        <Stack gap={5}>
          <SequenceStrip terms={challenge.terms} revealed={settled ? challenge.answer : undefined} />
          {challenge.input === 'choice' ? (
            <>
              <ChoiceList compact labels={text.optionLabels} selected={interactive ? selected : lastOption} correctIndex={correctIndex} wrongIndex={!interactive && lastOption !== correctIndex ? lastOption : null} onSelect={interactive ? select : undefined} />
              {submitButton(submitOption, selected === null)}
            </>
          ) : interactive ? (
            <>
              <NumberKeypad value={typed} onChange={setTyped} allowNegative={challenge.terms.some((v) => v !== null && v < 0)} />
              {submitButton(submitNumber, typed === '' || typed === '-')}
            </>
          ) : null}
        </Stack>
      );
    }
    case 'pattern':
      return (
        <Stack gap={5}>
          <PatternBoardView board={challenge.board} ct={ct} />
          <PatternOptions board={challenge.board} ct={ct} selected={interactive ? selected : lastOption} correctIndex={settled ? challenge.answer : undefined} wrongIndex={!interactive && lastOption !== challenge.answer ? lastOption : null} onSelect={interactive ? select : undefined} />
          {submitButton(submitOption, selected === null)}
        </Stack>
      );
    case 'deduction':
      return (
        <Stack gap={4}>
          <Card>
            <Stack gap={2}>
              {(challenge.spec.type === 'code' ? [text.prompt[0] ?? ''] : text.prompt.slice(0, -1)).map((line, i) => (
                <Text key={i}>{line}</Text>
              ))}
              {/* Code clues are drawn as a table (with spoken labels) instead of sentences. */}
              {challenge.spec.type === 'code' ? <CodeClues challenge={challenge} /> : null}
              <Text variant="subheading">{text.prompt[text.prompt.length - 1]}</Text>
            </Stack>
          </Card>
          {challenge.input === 'choice' ? (
            <>
              <ChoiceList labels={text.optionLabels} selected={interactive ? selected : lastOption} correctIndex={settled ? challenge.answer : undefined} wrongIndex={!interactive && lastOption !== challenge.answer ? lastOption : null} onSelect={interactive ? select : undefined} />
              {submitButton(submitOption, selected === null)}
            </>
          ) : interactive ? (
            <>
              <NumberKeypad value={typed} onChange={setTyped} maxLength={challenge.spec.type === 'code' ? challenge.spec.digits : 6} />
              {submitButton(submitNumber, typed === '')}
            </>
          ) : (
            <View style={{ alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: phase === 'correct' ? theme.colors.successSoft : theme.colors.surfaceAlt }}>
              <Text variant="display" tone={phase === 'correct' ? 'success' : 'default'}>
                {text.answerLabel}
              </Text>
            </View>
          )}
        </Stack>
      );
    case 'memory':
      return <MemoryPlay challenge={challenge} ct={ct} relaxed={relaxed} autoStart={replayToken > 0} review={settled ? { correct: phase === 'correct' } : null} onSubmit={onSubmit} />;
  }
}

/** Visual clue table for code-breaker puzzles (● right place, ○ wrong place). */
function CodeClues({ challenge }: { challenge: Extract<Challenge, { category: 'deduction' }> }) {
  const theme = useTheme();
  const { t } = useTranslation();
  if (challenge.spec.type !== 'code') return null;
  return (
    <Stack gap={2}>
      {challenge.spec.clues.map((c, i) => (
        <View key={i} accessible accessibilityLabel={t('game.codeClue', { guess: c.guess.split('').join(' '), correct: c.correct, misplaced: c.misplaced })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[...c.guess].map((d, k) => (
              <View key={k} style={{ width: 36, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }}>
                <Text variant="heading" style={{ fontFamily: theme.fonts.mono }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="subheading" tone="success">{`● ${c.correct}`}</Text>
          <Text variant="subheading" tone="warning">{`○ ${c.misplaced}`}</Text>
        </View>
      ))}
      <Text variant="caption" tone="muted">
        {t('game.codeLegend')}
      </Text>
    </Stack>
  );
}
