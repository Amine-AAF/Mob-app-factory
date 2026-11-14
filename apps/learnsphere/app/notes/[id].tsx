import { Chip, IconButton, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { NoteView } from '@/components/NoteView';
import { SubjectPicker } from '@/components/pickers';
import { Segmented, TextField } from '@/components/ui';
import { repos } from '@/database';
import { applyFormat, noteToMarkdown, type FormatAction } from '@/features/notes/format';
import { fmt } from '@/i18n';
import { shareText } from '@/services/files';
import { afterLearningWrite } from '@/services/progress';
import { READING_SCALE, usePreferences } from '@/store/preferences';
import { useIsPremium, useSession } from '@/store/session';
import { parseTags } from '@/utils/text';

const TOOLBAR: { action: FormatAction; icon: IconName }[] = [
  { action: 'heading', icon: 'text' },
  { action: 'subheading', icon: 'text-outline' },
  { action: 'bullet', icon: 'list' },
  { action: 'numbered', icon: 'list-circle-outline' },
  { action: 'highlight', icon: 'color-wand-outline' },
  { action: 'bold', icon: 'bold' as IconName },
  { action: 'quote', icon: 'chatbox-ellipses-outline' },
];

const AUTOSAVE_MS = 1200;

export default function NoteEditor() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const bump = useSession((s) => s.bump);
  const scale = READING_SCALE[usePreferences((s) => s.readingSize)];
  const params = useLocalSearchParams<{ id: string; subjectId?: string; chapterId?: string }>();
  const [noteId, setNoteId] = useState<string | null>(params.id === 'new' ? null : params.id);
  const [mode, setMode] = useState<'edit' | 'read'>(params.id === 'new' ? 'edit' : 'read');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [chapterId, setChapterId] = useState<string | null>(params.chapterId || null);
  const [favorite, setFavorite] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string; courseTitle: string }[]>([]);
  const selection = useRef({ start: 0, end: 0 });
  const dirty = useRef(false);
  const saving = useRef<Promise<void> | null>(null);

  useEffect(() => {
    void repos().subjects.list('all').then(setSubjects);
    if (!noteId) {
      // Chapter given without subject (from a course): resolve its subject.
      if (params.chapterId && !params.subjectId) {
        void repos()
          .db.getFirstAsync<{ subject_id: string }>('SELECT c.subject_id FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE ch.id = ?', [params.chapterId])
          .then((r) => r && setSubjectId(r.subject_id));
      }
      return;
    }
    void repos()
      .notes.get(noteId)
      .then((n) => {
        if (!n) return;
        setTitle(n.title);
        setBody(n.body);
        setTags(n.tags.join(', '));
        setSubjectId(n.subjectId);
        setChapterId(n.chapterId);
        setFavorite(n.favorite);
        setUpdatedAt(n.updatedAt);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per note
  }, []);

  useEffect(() => {
    // Chapters are only shown when a subject is selected (see `chapters.length && subjectId` below).
    if (subjectId) void repos().subjects.listSubjectChapters(subjectId).then(setChapters);
  }, [subjectId]);

  const save = useCallback(async () => {
    if (!dirty.current) return;
    if (!title.trim() && !body.trim()) return;
    dirty.current = false;
    const input = { title: title.trim() || t('notes.untitled'), body, tags: parseTags(tags), subjectId, chapterId };
    const task = (async () => {
      if (noteId) await repos().notes.update(noteId, input);
      else {
        const id = await repos().notes.create(input);
        setNoteId(id);
        await afterLearningWrite(repos());
      }
      setUpdatedAt(new Date().toISOString());
      bump();
    })();
    saving.current = task;
    await task;
  }, [title, body, tags, subjectId, chapterId, noteId, t, bump]);

  // Autosave shortly after typing stops, and when leaving the screen.
  useEffect(() => {
    if (!dirty.current) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [title, body, tags, subjectId, chapterId, save]);
  useEffect(() => () => void save(), [save]);

  const change = <T,>(setter: (v: T) => void) => (v: T) => {
    dirty.current = true;
    setter(v);
  };

  const format = (action: FormatAction) => {
    const next = applyFormat(body, selection.current, action);
    change(setBody)(next.body);
    selection.current = { start: next.cursor, end: next.cursor };
  };

  const exportNote = async () => {
    if (!isPremium) return router.push({ pathname: '/paywall', params: { source: 'export_notes' } });
    await save();
    const safe = (title || 'note').replace(/[^\w\- ]+/g, '').slice(0, 40) || 'note';
    await shareText(`${safe}.md`, noteToMarkdown({ title, body, tags: parseTags(tags) }), 'text/markdown');
  };

  const menu = () =>
    Alert.alert(title || t('notes.untitled'), undefined, [
      { text: t('notes.history'), onPress: () => noteId && router.push({ pathname: '/notes/history', params: { id: noteId } }) },
      { text: isPremium ? t('notes.export') : `${t('notes.export')} · ${t('premium.badge')}`, onPress: exportNote },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          Alert.alert(t('notes.deleteTitle'), t('notes.deleteBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: async () => {
                dirty.current = false;
                if (noteId) await repos().notes.remove(noteId);
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
      <RouterStack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Row gap={0}>
              {noteId ? (
                <IconButton
                  icon={favorite ? 'star' : 'star-outline'}
                  tone={favorite ? 'accent' : 'default'}
                  label={favorite ? t('common.unfavorite') : t('common.favorite')}
                  onPress={async () => {
                    await repos().notes.setFavorite(noteId, !favorite);
                    setFavorite(!favorite);
                    bump();
                  }}
                />
              ) : null}
              <IconButton icon="ellipsis-vertical" label={t('common.more')} onPress={menu} />
            </Row>
          ),
        }}
      />
      <Segmented
        value={mode}
        onChange={async (m) => {
          if (m === 'read') await save();
          setMode(m);
        }}
        options={[
          { value: 'read', label: t('notes.read') },
          { value: 'edit', label: t('notes.edit') },
        ]}
      />
      {mode === 'read' ? (
        <Stack gap={3}>
          <Text variant="display" style={{ fontSize: 28 * scale, lineHeight: 34 * scale }}>
            {title || t('notes.untitled')}
          </Text>
          {updatedAt ? (
            <Text variant="caption" tone="subtle">
              {t('notes.updated', { date: fmt.dateTime(updatedAt) })}
            </Text>
          ) : null}
          {body.trim() ? <NoteView body={body} testID="note-view" /> : <Text tone="muted">{t('notes.emptyNote')}</Text>}
        </Stack>
      ) : (
        <Stack gap={3}>
          <TextInput
            value={title}
            onChangeText={change(setTitle)}
            placeholder={t('notes.titlePlaceholder')}
            placeholderTextColor={theme.colors.textSubtle}
            accessibilityLabel={t('notes.titlePlaceholder')}
            maxLength={120}
            testID="note-title"
            style={{ fontSize: 24, fontWeight: '700', color: theme.colors.text, minHeight: 48 }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ gap: 6 }}>
            {TOOLBAR.map((b) => (
              <Pressable
                key={b.action}
                onPress={() => format(b.action)}
                accessibilityRole="button"
                accessibilityLabel={t(`notes.format.${b.action}`)}
                style={({ pressed }) => ({ height: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 })}
              >
                <Text variant="caption" style={{ fontWeight: '700' }}>
                  {t(`notes.format.${b.action}Short`)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <TextInput
            value={body}
            onChangeText={change(setBody)}
            onSelectionChange={(e) => (selection.current = e.nativeEvent.selection)}
            placeholder={t('notes.bodyPlaceholder')}
            placeholderTextColor={theme.colors.textSubtle}
            accessibilityLabel={t('notes.bodyPlaceholder')}
            multiline
            testID="note-body"
            textAlignVertical="top"
            style={{ minHeight: 280, fontSize: 17 * scale, lineHeight: 26 * scale, color: theme.colors.text, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12 }}
          />
          <Text variant="caption" tone="subtle">
            {t('notes.formatHelp')}
          </Text>
          <TextField label={t('notes.tags')} placeholder={t('notes.tagsPlaceholder')} value={tags} onChangeText={change(setTags)} autoCapitalize="none" />
          <SubjectPicker label={t('common.subject')} subjects={subjects} value={subjectId} onChange={(v) => (change(setSubjectId)(v), change(setChapterId)(null))} />
          {subjectId && chapters.length ? (
            <Stack gap={2}>
              <Text variant="bodySmall" style={{ fontWeight: '600' }}>
                {t('common.chapter')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <Chip label={t('common.none')} selected={chapterId === null} onPress={() => change(setChapterId)(null)} />
                {chapters.map((c) => (
                  <Chip key={c.id} label={c.title} selected={chapterId === c.id} onPress={() => change(setChapterId)(c.id)} />
                ))}
              </ScrollView>
            </Stack>
          ) : null}
          <View style={{ height: 24 }} />
        </Stack>
      )}
    </Screen>
  );
}
