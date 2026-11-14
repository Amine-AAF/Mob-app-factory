import { Button, Chip, Divider, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';

import { SubjectPicker } from '@/components/pickers';
import { Panel, TextField } from '@/components/ui';
import { canCreate } from '@/config/limits';
import { repos } from '@/database';
import type { CardDifficulty, Flashcard } from '@/database/repositories/flashcards';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { afterLearningWrite } from '@/services/progress';
import { useIsPremium, useSession } from '@/store/session';
import { parseTags } from '@/utils/text';

export default function FlashcardEdit() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const bump = useSession((s) => s.bump);
  const params = useLocalSearchParams<{ id?: string; subjectId?: string; chapterId?: string }>();
  const [card, setCard] = useState<Flashcard | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState<CardDifficulty>('medium');
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [chapterId, setChapterId] = useState<string | null>(params.chapterId || null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(0);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('all'), []);
  const { data: chapters = [] } = useAsync(() => (subjectId ? repos().subjects.listSubjectChapters(subjectId) : Promise.resolve([])), [subjectId]);
  const { data: history = [] } = useAsync(() => (params.id ? repos().flashcards.history(params.id) : Promise.resolve([])), [params.id]);

  useEffect(() => {
    if (params.id) {
      void repos()
        .flashcards.get(params.id)
        .then((c) => {
          if (!c) return;
          setCard(c);
          setFront(c.front);
          setBack(c.back);
          setTags(c.tags.join(', '));
          setDifficulty(c.difficulty);
          setSubjectId(c.subjectId);
          setChapterId(c.chapterId);
        });
    } else if (params.chapterId && !params.subjectId) {
      void repos()
        .db.getFirstAsync<{ subject_id: string }>('SELECT c.subject_id FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.id = ?', [params.chapterId])
        .then((r) => r && setSubjectId(r.subject_id));
    }
  }, [params.id, params.chapterId, params.subjectId]);

  const save = async (addAnother: boolean) => {
    if (!front.trim() || !back.trim()) return setError(t('flashcards.bothSides'));
    const input = { front, back, tags: parseTags(tags), difficulty, subjectId, chapterId };
    if (card) {
      await repos().flashcards.update(card.id, input);
      bump();
      return router.back();
    }
    if (!canCreate('flashcards', await repos().flashcards.count(), isPremium)) return router.replace({ pathname: '/paywall', params: { source: 'flashcards_limit' } });
    await repos().flashcards.create(input);
    await afterLearningWrite(repos());
    if (addAnother) {
      setFront('');
      setBack('');
      setAdded((n) => n + 1);
    } else router.back();
  };

  const menu = () =>
    card &&
    Alert.alert(t('flashcards.card'), undefined, [
      {
        text: t('flashcards.resetProgress'),
        onPress: async () => {
          await repos().flashcards.resetProgress(card.id);
          bump();
          router.back();
        },
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().flashcards.remove(card.id);
          bump();
          router.back();
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {!card ? <Button label={t('flashcards.saveAndNew')} variant="secondary" onPress={() => save(true)} testID="card-save-new" /> : null}
          <Stack style={{ flex: 1 }}>
            <Button label={t('common.save')} onPress={() => save(false)} testID="card-save" />
          </Stack>
        </Row>
      }
    >
      <RouterStack.Screen
        options={{
          title: card ? t('flashcards.editCard') : t('flashcards.new'),
          headerRight: card
            ? () => (
                <Row gap={0}>
                  <IconButton
                    icon={card.favorite ? 'star' : 'star-outline'}
                    tone={card.favorite ? 'accent' : 'default'}
                    label={card.favorite ? t('common.unfavorite') : t('common.favorite')}
                    onPress={async () => {
                      await repos().flashcards.setFavorite(card.id, !card.favorite);
                      setCard({ ...card, favorite: !card.favorite });
                      bump();
                    }}
                  />
                  <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} />
                </Row>
              )
            : undefined,
        }}
      />
      {added > 0 ? (
        <Text variant="bodySmall" tone="success">
          {t('flashcards.added', { count: added })}
        </Text>
      ) : null}
      <TextField label={t('flashcards.front')} placeholder={t('flashcards.frontPlaceholder')} value={front} onChangeText={(v) => (setFront(v), setError(null))} multiline maxLength={500} testID="card-front" error={error} />
      <TextField label={t('flashcards.back')} placeholder={t('flashcards.backPlaceholder')} value={back} onChangeText={(v) => (setBack(v), setError(null))} multiline maxLength={1000} testID="card-back" />
      <Stack gap={2}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('flashcards.difficultyLabel')}
        </Text>
        <Row gap={2}>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <Chip key={d} label={t(`flashcards.difficulty.${d}`)} selected={difficulty === d} onPress={() => setDifficulty(d)} />
          ))}
        </Row>
      </Stack>
      <TextField label={t('notes.tags')} placeholder={t('notes.tagsPlaceholder')} value={tags} onChangeText={setTags} autoCapitalize="none" />
      <SubjectPicker label={t('common.subject')} subjects={subjects} value={subjectId} onChange={(v) => (setSubjectId(v), setChapterId(null))} />
      {chapters.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('common.none')} selected={chapterId === null} onPress={() => setChapterId(null)} />
          {chapters.map((c) => (
            <Chip key={c.id} label={c.title} selected={chapterId === c.id} onPress={() => setChapterId(c.id)} />
          ))}
        </ScrollView>
      ) : null}
      {card ? (
        <Panel title={t('flashcards.history')} icon="time-outline">
          <Text variant="bodySmall" tone="muted">
            {t('flashcards.created', { date: fmt.dateTime(card.createdAt) })}
            {card.lastReviewedAt ? ` · ${t('flashcards.nextReview', { date: fmt.day(card.dueDay) })}` : ''}
          </Text>
          {history.length === 0 ? (
            <Text variant="bodySmall" tone="subtle">
              {t('flashcards.notReviewed')}
            </Text>
          ) : (
            history.slice(0, 15).map((h, i) => (
              <Stack key={h.id} gap={1}>
                {i > 0 ? <Divider /> : null}
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="bodySmall">{fmt.day(h.day)}</Text>
                  <Text variant="bodySmall" tone={h.grade === 'again' ? 'danger' : h.grade === 'easy' ? 'success' : 'default'}>
                    {t(`flashcards.grades.${h.grade}`)}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {t('flashcards.intervalChange', { before: h.intervalBefore, after: h.intervalAfter })}
                  </Text>
                </Row>
              </Stack>
            ))
          )}
        </Panel>
      ) : null}
    </Screen>
  );
}
