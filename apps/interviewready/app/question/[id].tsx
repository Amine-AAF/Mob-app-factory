import { Badge, Button, Card, EmptyState, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput } from 'react-native';

import { AnswerCard, BulletList, DifficultyBadge, PremiumBadge } from '@/components/content';
import { repos } from '@/database';
import { NOTE_MAX_LENGTH } from '@/database/repositories/libraryRepository';
import { canReadAnswer } from '@/features/questions/search';
import { useAsync } from '@/hooks/useAsync';
import { useQuestions } from '@/hooks/useContent';
import { recordError, track } from '@/services/analytics';
import { saveNote, setStudied, toggleFavorite, viewQuestion } from '@/services/library';
import { useIsPremium } from '@/store/session';

export default function QuestionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id, daily } = useLocalSearchParams<{ id: string; daily?: string }>();
  const isPremium = useIsPremium();
  const question = useQuestions().find((q) => q.id === id);
  const [note, setNote] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    if (question) viewQuestion(question.id).catch((e) => recordError(e, 'view_question'));
  }, [question]);

  const { data } = useAsync(async () => {
    if (!id) return undefined;
    const [favorite, studiedIds, savedNote] = await Promise.all([repos().library.isFavorite(id), repos().library.studiedIds(), repos().library.getNote(id)]);
    return { favorite, studied: studiedIds.has(id), note: savedNote };
  }, [id]);

  if (!question) {
    return (
      <Screen>
        <EmptyState icon="help-circle-outline" title={t('question.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const unlocked = canReadAnswer(question, isPremium);
  const isModelAnswer = question.kind !== 'technical';
  const noteValue = note ?? data?.note ?? '';

  const onFavorite = async () => {
    const result = await toggleFavorite(question.id, isPremium);
    if (result === 'limit-reached') {
      Alert.alert(t('question.favoriteLimitTitle'), t('question.favoriteLimitBody'), [
        { text: t('common.close'), style: 'cancel' },
        { text: t('paywall.cta'), onPress: () => router.push({ pathname: '/paywall', params: { source: 'favorites_limit' } }) },
      ]);
    }
  };

  const onSaveNote = async () => {
    await saveNote(question.id, noteValue);
    setNoteSaved(true);
  };

  return (
    <Screen edges={[]} testID="question-detail">
      <RouterStack.Screen options={{ title: t(`categories.${question.category}`) }} />
      <Stack gap={2}>
        <Text variant="caption" tone="muted">
          {t(`topics.${question.topic}`)}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {question.question}
        </Text>
        <Row gap={2} wrap>
          <DifficultyBadge level={question.difficulty} />
          {question.premium ? <PremiumBadge /> : null}
          {question.skills.map((s) => (
            <Badge key={s} label={t(`skills.${s}`)} tone="neutral" />
          ))}
        </Row>
      </Stack>

      <Row gap={2}>
        <Button
          label={data?.favorite ? t('question.removeFavorite') : t('question.addFavorite')}
          icon={data?.favorite ? 'bookmark' : 'bookmark-outline'}
          variant="secondary"
          onPress={onFavorite}
          testID="toggle-favorite"
        />
        <Button
          label={data?.studied ? t('question.studied') : t('question.markStudied')}
          icon={data?.studied ? 'checkmark-circle' : 'checkmark-circle-outline'}
          variant={data?.studied ? 'secondary' : 'primary'}
          onPress={() => setStudied(question.id, !data?.studied, daily === '1')}
          testID="toggle-studied"
        />
      </Row>

      <AnswerCard title={t('question.intent')} icon="eye-outline" tone="alt">
        <Text>{question.intent}</Text>
      </AnswerCard>

      {unlocked ? (
        <>
          <AnswerCard title={isModelAnswer ? t('question.modelAnswer') : t('question.expectedAnswer')} icon="chatbox-ellipses-outline">
            <Text>{question.expectedAnswer}</Text>
            {isModelAnswer ? (
              <Text variant="caption" tone="subtle">
                {t('question.adaptDisclaimer')}
              </Text>
            ) : null}
          </AnswerCard>
          <AnswerCard title={t('question.explanation')} icon="bulb-outline">
            <Text>{question.explanation}</Text>
          </AnswerCard>
          {question.example ? (
            <AnswerCard title={t('question.example')} icon="code-slash-outline" tone="alt">
              <Text variant="mono" selectable>
                {question.example}
              </Text>
            </AnswerCard>
          ) : null}
          <AnswerCard title={t('question.tips')} icon="checkmark-done-outline">
            <BulletList items={question.tips} />
          </AnswerCard>
          <AnswerCard title={t('question.mistakes')} icon="alert-circle-outline">
            <BulletList items={question.commonMistakes} />
          </AnswerCard>
          <AnswerCard title={t('question.followUps')} icon="return-down-forward-outline">
            <BulletList items={question.followUpQuestions} />
          </AnswerCard>
        </>
      ) : (
        <Card tone="accent" testID="locked-answer">
          <Stack gap={3}>
            <Text variant="heading">{t('question.lockedTitle')}</Text>
            <Text>{t('question.lockedBody')}</Text>
            <Button
              label={t('paywall.cta')}
              icon="diamond-outline"
              onPress={() => {
                track('premium_viewed', { source: 'locked_question' });
                router.push({ pathname: '/paywall', params: { source: 'locked_question' } });
              }}
            />
          </Stack>
        </Card>
      )}

      <AnswerCard title={t('question.notes')} icon="create-outline">
        <TextInput
          value={noteValue}
          onChangeText={(v) => {
            setNote(v);
            setNoteSaved(false);
          }}
          placeholder={t('question.notesPlaceholder')}
          placeholderTextColor={theme.colors.textSubtle}
          multiline
          maxLength={NOTE_MAX_LENGTH}
          accessibilityLabel={t('question.notes')}
          style={{
            minHeight: 100,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.md,
            padding: 12,
            textAlignVertical: 'top',
            fontSize: 16,
          }}
          testID="note-input"
        />
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="caption" tone="subtle">
            {noteSaved ? t('common.saved') : t('question.notesPrivate')}
          </Text>
          <Button label={t('common.save')} variant="secondary" onPress={onSaveNote} disabled={note === null} testID="save-note" />
        </Row>
      </AnswerCard>
    </Screen>
  );
}
