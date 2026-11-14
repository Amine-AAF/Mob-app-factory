import { Button, Divider, Icon, IconButton, ListRow, ProgressBar, Row, Screen, Text, useTheme } from '@factory/design-system';
import * as Linking from 'expo-linking';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { LimitNotice, Panel, SubjectIcon, TextField } from '@/components/ui';
import { canCreate, FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { deleteLocalFile, importPdf, openFile } from '@/services/files';
import { afterLearningWrite } from '@/services/progress';
import { useIsPremium, useSession } from '@/store/session';

export default function SubjectDetail() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const bump = useSession((s) => s.bump);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newCourse, setNewCourse] = useState('');
  const [link, setLink] = useState('');
  const { data } = useAsync(async () => {
    const r = repos();
    const [subject, courses, resources, notes, cards, agenda] = await Promise.all([
      r.subjects.get(id),
      r.subjects.listCourses(id),
      r.subjects.listResources(id),
      r.notes.list({ subjectId: id }),
      r.flashcards.list({ subjectId: id }),
      r.agenda.list({ subjectId: id }),
    ]);
    const questions = await r.quiz.questions(id);
    return { subject, courses, resources, notes, cards, agenda, questions };
  }, [id]);

  if (!data?.subject) return <Screen edges={[]}>{null}</Screen>;
  const s = data.subject;

  const addCourse = async () => {
    if (!newCourse.trim()) return;
    if (!canCreate('coursesPerSubject', data.courses.length, isPremium)) return router.push({ pathname: '/paywall', params: { source: 'courses_limit' } });
    await repos().subjects.createCourse(s.id, newCourse);
    setNewCourse('');
    bump();
  };

  const addPdf = async () => {
    const r = await importPdf();
    if (r.status === 'ok') {
      await repos().subjects.addResource({ subjectId: s.id, courseId: null, kind: 'pdf', title: r.name, uri: r.uri, sizeBytes: r.size });
      bump();
    } else if (r.status === 'too_large') Alert.alert(t('resources.tooLarge'));
    else if (r.status === 'error') Alert.alert(t('common.error'));
  };

  const addLink = async () => {
    const url = link.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return Alert.alert(t('validation.url'));
    await repos().subjects.addResource({ subjectId: s.id, courseId: null, kind: 'link', title: url.replace(/^https?:\/\//i, '').slice(0, 80), uri: url, sizeBytes: null });
    setLink('');
    bump();
  };

  const menu = () =>
    Alert.alert(s.name, undefined, [
      { text: t('common.edit'), onPress: () => router.push({ pathname: '/subject/edit', params: { id: s.id } }) },
      {
        text: s.archived ? t('courses.unarchive') : t('courses.archive'),
        onPress: async () => {
          if (s.archived && !isPremium && !canCreate('subjects', await repos().subjects.countActive(), false)) return router.push({ pathname: '/paywall', params: { source: 'subjects_limit' } });
          await repos().subjects.setArchived(s.id, !s.archived);
          bump();
        },
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('courses.deleteTitle'), t('courses.deleteBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                for (const res of data.resources) if (res.kind === 'pdf') deleteLocalFile(res.uri);
                await repos().subjects.remove(s.id);
                await afterLearningWrite(repos());
                router.back();
              },
            },
          ]),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Row gap={0}>
              <IconButton
                icon={s.favorite ? 'star' : 'star-outline'}
                tone={s.favorite ? 'accent' : 'default'}
                label={s.favorite ? t('common.unfavorite') : t('common.favorite')}
                onPress={async () => {
                  await repos().subjects.setFavorite(s.id, !s.favorite);
                  bump();
                }}
              />
              <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} />
            </Row>
          ),
        }}
      />
      <Row gap={3}>
        <SubjectIcon icon={s.icon} color={s.color} size={56} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{s.name}</Text>
          {s.archived ? (
            <Text variant="caption" tone="warning">
              {t('courses.archived')}
            </Text>
          ) : null}
        </View>
      </Row>
      {s.description ? <Text tone="muted">{s.description}</Text> : null}
      <Panel title={t('courses.progress')} icon="trending-up-outline">
        <ProgressBar progress={s.progress} label={t('courses.progress')} />
        <Text variant="bodySmall" tone="muted">
          {t('courses.chaptersDone', { done: s.chaptersDone, total: s.chapters })}
        </Text>
        {s.objective ? (
          <Row gap={2}>
            <Icon name="flag-outline" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {s.objective}
            </Text>
          </Row>
        ) : null}
        <Text variant="caption" tone="subtle">
          {[s.startDay ? t('courses.started', { date: fmt.day(s.startDay) }) : null, s.targetDay ? t('courses.target', { date: fmt.day(s.targetDay) }) : null].filter(Boolean).join(' · ')}
        </Text>
      </Panel>

      <Row gap={2}>
        <Button size="md" icon="timer-outline" label={t('focus.start')} onPress={() => router.push({ pathname: '/focus', params: { subjectId: s.id } })} />
        <View style={{ flex: 1 }}>
          <Button size="md" variant="secondary" icon="calendar-outline" label={t('planner.plan')} onPress={() => router.push({ pathname: '/planner/session', params: { subjectId: s.id } })} />
        </View>
      </Row>

      <Panel title={t('courses.courses')} icon="book-outline">
        {data.courses.map((c) => (
          <Pressable key={c.id} onPress={() => router.push({ pathname: '/course/[id]', params: { id: c.id } })} accessibilityRole="button" accessibilityLabel={c.title}>
            <Row gap={3} style={{ paddingVertical: 6 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text>{c.title}</Text>
                <ProgressBar progress={c.chapters ? c.chaptersDone / c.chapters : 0} height={5} label={c.title} />
              </View>
              <Text variant="caption" tone="subtle">
                {c.chaptersDone}/{c.chapters}
              </Text>
              <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
            </Row>
          </Pressable>
        ))}
        {!isPremium && data.courses.length >= FREE_LIMITS.coursesPerSubject ? (
          <LimitNotice message={t('limits.courses', { count: FREE_LIMITS.coursesPerSubject })} onUpgrade={() => router.push({ pathname: '/paywall', params: { source: 'courses_limit' } })} />
        ) : (
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <TextField placeholder={t('courses.newCourse')} value={newCourse} onChangeText={setNewCourse} onSubmitEditing={addCourse} maxLength={80} testID="new-course" />
            </View>
            <IconButton icon="add-circle" tone="primary" label={t('courses.addCourse')} onPress={addCourse} size={30} />
          </Row>
        )}
      </Panel>

      <Panel title={t('courses.studyMaterials')} icon="layers-outline">
        <ListRow icon="document-text-outline" title={t('notes.title')} subtitle={t('courses.notesCount', { count: data.notes.length })} onPress={() => router.push({ pathname: '/notes', params: { subjectId: s.id } })} />
        <Divider />
        <ListRow icon="albums-outline" title={t('flashcards.title')} subtitle={t('courses.cardsCount', { count: data.cards.length })} onPress={() => router.push({ pathname: '/(tabs)/flashcards', params: { subjectId: s.id } })} />
        <Divider />
        <ListRow icon="help-circle-outline" title={t('quiz.myQuestions')} subtitle={t('courses.questionsCount', { count: data.questions.length })} onPress={() => router.push({ pathname: '/quiz/bank', params: { bank: s.id } })} />
        <Divider />
        <ListRow icon="alarm-outline" title={t('agenda.title')} subtitle={t('courses.agendaCount', { count: data.agenda.length })} onPress={() => router.push({ pathname: '/agenda', params: { subjectId: s.id } })} />
      </Panel>

      <Panel title={t('resources.title')} icon="attach-outline">
        <Text variant="caption" tone="subtle">
          {t('resources.pdfNote')}
        </Text>
        {data.resources.map((r) => (
          <Row key={r.id} gap={2}>
            <Icon name={r.kind === 'pdf' ? 'document-attach-outline' : 'link-outline'} size={20} color={theme.colors.textMuted} />
            <Pressable style={{ flex: 1 }} onPress={() => (r.kind === 'pdf' ? openFile(r.uri) : Linking.openURL(r.uri))} accessibilityRole="link" accessibilityLabel={r.title}>
              <Text numberOfLines={1}>{r.title}</Text>
              {r.sizeBytes ? (
                <Text variant="caption" tone="subtle">
                  {fmt.number(Math.round(r.sizeBytes / 1024))} KB
                </Text>
              ) : null}
            </Pressable>
            <IconButton
              icon="trash-outline"
              label={t('common.delete')}
              onPress={async () => {
                const removed = await repos().subjects.removeResource(r.id);
                if (removed?.kind === 'pdf') deleteLocalFile(removed.uri);
                bump();
              }}
            />
          </Row>
        ))}
        <Button size="md" variant="secondary" icon="document-attach-outline" label={t('resources.importPdf')} onPress={addPdf} />
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <TextField placeholder={t('resources.linkPlaceholder')} value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" onSubmitEditing={addLink} />
          </View>
          <IconButton icon="add-circle" tone="primary" label={t('resources.addLink')} onPress={addLink} size={30} />
        </Row>
      </Panel>
    </Screen>
  );
}
