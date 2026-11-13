import { Button, Chip, Divider, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { LimitNotice, Panel, Segmented, Stepper, ToggleRow } from '@/components/ui';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { BUNDLED_BANK_IDS } from '@/content';
import { repos } from '@/database';
import type { QuizMode } from '@/features/quiz/engine';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

/** Quiz setup for one bank (bundled or a subject's own questions). */
export default function QuizBank() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { bank } = useLocalSearchParams<{ bank: string }>();
  const bundled = BUNDLED_BANK_IDS.includes(bank);
  const [mode, setMode] = useState<QuizMode>('practice');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | null>(null);
  const { data } = useAsync(async () => ({
    questions: await repos().quiz.questions(bank),
    subject: bundled ? null : await repos().subjects.get(bank),
    userCount: await repos().quiz.countUserQuestions(),
  }), [bank]);

  if (!data) return <Screen edges={[]}>{null}</Screen>;
  const available = difficulty ? data.questions.filter((q) => q.difficulty === difficulty).length : data.questions.length;
  const title = bundled ? t(`quiz.banks.${bank}`) : (data.subject?.name ?? t('quiz.myQuestions'));
  const canAdd = canCreate('customQuestions', data.userCount, isPremium);

  const start = () =>
    router.push({
      pathname: '/quiz/run',
      params: { bank, mode, count: String(Math.min(count, available)), timeLimit: mode === 'exam' && timed ? String(minutes * 60) : '', difficulty: difficulty ? String(difficulty) : '', seed: String(Date.now()) },
    });

  return (
    <Screen edges={[]} footer={<Button label={t('quiz.start')} icon="play" onPress={start} disabled={available === 0} testID="quiz-start" />}>
      <RouterStack.Screen options={{ title }} />
      <Panel title={t('quiz.setup')} icon="options-outline">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'practice', label: t('quiz.modes.practice') },
            { value: 'exam', label: t('quiz.modes.exam') },
          ]}
        />
        <Text variant="bodySmall" tone="muted">
          {t(`quiz.modeHelp.${mode}`)}
        </Text>
        <Stepper label={t('quiz.questions')} value={Math.min(count, Math.max(1, available))} onChange={setCount} min={1} max={Math.max(1, Math.min(50, available))} />
        <Stack gap={2}>
          <Text variant="bodySmall" style={{ fontWeight: '600' }}>
            {t('quiz.difficulty')}
          </Text>
          <Row gap={2} wrap>
            <Chip label={t('quiz.allLevels')} selected={difficulty === null} onPress={() => setDifficulty(null)} />
            {([1, 2, 3] as const).map((d) => (
              <Chip key={d} label={t(`quiz.levels.${d}`)} selected={difficulty === d} onPress={() => setDifficulty(d)} />
            ))}
          </Row>
        </Stack>
        {mode === 'exam' ? (
          <>
            <ToggleRow title={t('quiz.timer')} subtitle={t('quiz.timerHelp')} value={timed} onChange={setTimed} />
            {timed ? <Stepper label={t('quiz.timeLimit')} value={minutes} onChange={setMinutes} min={1} max={180} step={1} format={fmt.duration} /> : null}
          </>
        ) : null}
        <Text variant="caption" tone="subtle">
          {t('quiz.available', { count: available })}
        </Text>
      </Panel>

      {!bundled ? (
        <Panel title={t('quiz.myQuestions')} icon="create-outline">
          {!canAdd ? <LimitNotice message={t('limits.questions', { count: FREE_LIMITS.customQuestions })} onUpgrade={() => router.push({ pathname: '/paywall', params: { source: 'questions_limit' } })} /> : null}
          {data.questions.length === 0 ? <EmptyState icon="help-circle-outline" title={t('quiz.noQuestions')} message={t('quiz.noQuestionsBody')} /> : null}
          {data.questions.map((q, i) => (
            <Stack key={q.id} gap={1}>
              {i > 0 ? <Divider /> : null}
              <Pressable onPress={() => router.push({ pathname: '/quiz/question', params: { subjectId: bank, id: q.id } })} accessibilityRole="button" accessibilityLabel={q.prompt}>
                <Row gap={2} style={{ paddingVertical: 6 }}>
                  <Text style={{ flex: 1 }} numberOfLines={2}>
                    {q.prompt}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {t(`quiz.types.${q.type}`)}
                  </Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.textSubtle} />
                </Row>
              </Pressable>
            </Stack>
          ))}
          <Button size="md" variant="secondary" icon="add" label={t('quiz.addQuestion')} disabled={!canAdd} onPress={() => router.push({ pathname: '/quiz/question', params: { subjectId: bank } })} testID="add-question" />
        </Panel>
      ) : null}
    </Screen>
  );
}
