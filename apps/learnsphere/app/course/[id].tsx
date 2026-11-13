import { Chip, Icon, IconButton, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { Panel, TextField } from '@/components/ui';
import { repos } from '@/database';
import type { Chapter } from '@/database/repositories/subjects';
import { useAsync } from '@/hooks/useAsync';
import { afterLearningWrite } from '@/services/progress';
import { useSession } from '@/store/session';

function ChapterRow({ chapter, index, count, courseId }: { chapter: Chapter; index: number; count: number; courseId: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const bump = useSession((s) => s.bump);
  const [open, setOpen] = useState(false);
  const [lesson, setLesson] = useState('');
  const { data: lessons } = useAsync(() => (open ? repos().subjects.listLessons(chapter.id) : Promise.resolve([])), [open, chapter.id]);
  const done = !!chapter.completedAt;

  const toggleDone = async () => {
    await repos().subjects.setChapterDone(chapter.id, !done);
    await afterLearningWrite(repos());
  };
  const [renaming, setRenaming] = useState<string | null>(null);
  const saveRename = async () => {
    if (renaming?.trim()) await repos().subjects.renameChapter(chapter.id, renaming);
    setRenaming(null);
    bump();
  };

  const menu = () =>
    Alert.alert(chapter.title, undefined, [
      { text: t('common.rename'), onPress: () => setRenaming(chapter.title) },
      {
        text: t('common.delete'),
        style: 'destructive' as const,
        onPress: async () => {
          await repos().subjects.removeChapter(chapter.id);
          bump();
        },
      },
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);

  const addLesson = async () => {
    if (!lesson.trim()) return;
    await repos().subjects.createLesson(chapter.id, lesson);
    setLesson('');
    bump();
  };

  return (
    <View style={{ borderRadius: theme.radius.md, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, padding: 12, gap: 8 }}>
      <Row gap={2}>
        <Pressable onPress={toggleDone} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={chapter.title} hitSlop={8}>
          <Icon name={done ? 'checkmark-circle' : 'ellipse-outline'} size={26} color={done ? theme.colors.success : theme.colors.textSubtle} />
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${chapter.title}, ${t('courses.lessonsCount', { count: chapter.lessons })}`}>
          <Text variant="caption" tone="subtle">
            {t(chapter.kind === 'module' ? 'courses.moduleN' : 'courses.chapterN', { n: index + 1 })}
          </Text>
          <Text style={{ textDecorationLine: done ? 'line-through' : 'none' }}>{chapter.title}</Text>
          {chapter.lessons ? (
            <Text variant="caption" tone="subtle">
              {t('courses.lessonsProgress', { done: chapter.lessonsDone, total: chapter.lessons })}
            </Text>
          ) : null}
        </Pressable>
        <IconButton icon="arrow-up" label={t('courses.moveUp')} onPress={async () => index > 0 && (await repos().subjects.moveChapter(courseId, chapter.id, -1), bump())} size={18} />
        <IconButton icon="arrow-down" label={t('courses.moveDown')} onPress={async () => index < count - 1 && (await repos().subjects.moveChapter(courseId, chapter.id, 1), bump())} size={18} />
        <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} size={18} />
      </Row>
      {renaming !== null ? (
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <TextField value={renaming} onChangeText={setRenaming} onSubmitEditing={saveRename} autoFocus maxLength={100} accessibilityLabel={t('common.rename')} />
          </View>
          <IconButton icon="checkmark-circle" tone="primary" label={t('common.save')} onPress={saveRename} size={28} />
        </Row>
      ) : null}
      {open ? (
        <Stack gap={2} style={{ paddingLeft: 34 }}>
          {lessons?.map((l) => (
            <Row key={l.id} gap={2}>
              <Pressable
                onPress={async () => {
                  await repos().subjects.setLessonDone(l.id, !l.completedAt);
                  await afterLearningWrite(repos());
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: !!l.completedAt }}
                accessibilityLabel={l.title}
                style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', minHeight: 40 }}
              >
                <Icon name={l.completedAt ? 'checkbox' : 'square-outline'} size={20} color={l.completedAt ? theme.colors.success : theme.colors.textSubtle} />
                <Text variant="bodySmall" style={{ flex: 1 }}>
                  {l.title}
                </Text>
              </Pressable>
              <IconButton
                icon="close"
                size={16}
                label={t('common.delete')}
                onPress={async () => {
                  await repos().subjects.removeLesson(l.id);
                  bump();
                }}
              />
            </Row>
          ))}
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <TextField placeholder={t('courses.newLesson')} value={lesson} onChangeText={setLesson} onSubmitEditing={addLesson} maxLength={100} />
            </View>
            <IconButton icon="add-circle" tone="primary" label={t('courses.addLesson')} onPress={addLesson} size={26} />
          </Row>
          <Row gap={2} wrap>
            <Chip label={t('notes.new')} selected={false} icon="create-outline" onPress={() => router.push({ pathname: '/notes/[id]', params: { id: 'new', chapterId: chapter.id } })} />
            <Chip label={t('flashcards.new')} selected={false} icon="albums-outline" onPress={() => router.push({ pathname: '/flashcards/edit', params: { chapterId: chapter.id } })} />
          </Row>
        </Stack>
      ) : null}
    </View>
  );
}

export default function CourseDetail() {
  const { t } = useTranslation();
  const bump = useSession((s) => s.bump);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'chapter' | 'module'>('chapter');
  const { data } = useAsync(async () => {
    const course = await repos().subjects.getCourse(id);
    const chapters = await repos().subjects.listChapters(id);
    return { course, chapters };
  }, [id]);

  if (!data?.course) return <Screen edges={[]}>{null}</Screen>;
  const c = data.course;

  const add = async () => {
    if (!title.trim()) return;
    await repos().subjects.createChapter(c.id, title, kind);
    setTitle('');
    bump();
  };

  const menu = () =>
    Alert.alert(c.title, undefined, [
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('courses.deleteCourseTitle'), t('courses.deleteCourseBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                await repos().subjects.removeCourse(c.id);
                bump();
                router.back();
              },
            },
          ]),
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: c.title, headerRight: () => <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} /> }} />
      <Panel title={t('courses.progress')} icon="trending-up-outline">
        <ProgressBar progress={c.chapters ? c.chaptersDone / c.chapters : 0} label={t('courses.progress')} />
        <Text variant="bodySmall" tone="muted">
          {t('courses.chaptersDone', { done: c.chaptersDone, total: c.chapters })}
        </Text>
      </Panel>
      <Stack gap={2}>
        {data.chapters.map((ch, i) => (
          <ChapterRow key={ch.id} chapter={ch} index={i} count={data.chapters.length} courseId={c.id} />
        ))}
      </Stack>
      <Panel title={t('courses.addChapter')} icon="add-circle-outline">
        <Row gap={2}>
          <Chip label={t('courses.kinds.chapter')} selected={kind === 'chapter'} onPress={() => setKind('chapter')} />
          <Chip label={t('courses.kinds.module')} selected={kind === 'module'} onPress={() => setKind('module')} />
        </Row>
        <Row gap={2}>
          <View style={{ flex: 1 }}>
            <TextField placeholder={t('courses.newChapter')} value={title} onChangeText={setTitle} onSubmitEditing={add} maxLength={100} testID="new-chapter" />
          </View>
          <IconButton icon="add-circle" tone="primary" label={t('courses.addChapter')} onPress={add} size={30} />
        </Row>
      </Panel>
    </Screen>
  );
}
