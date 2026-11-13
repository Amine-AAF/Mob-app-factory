import { Button, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DayField, SubjectPicker, TimeField } from '@/components/pickers';
import { TextField, ToggleRow } from '@/components/ui';
import { repos } from '@/database';
import { DEADLINE_KINDS, EXAM_KINDS, tableForKind, type AgendaKind, type Priority } from '@/features/agenda/agenda';
import { useAsync } from '@/hooks/useAsync';
import { clock } from '@/services/clock';
import { rescheduleAll } from '@/services/notifications';
import { useSession } from '@/store/session';

export default function AgendaEdit() {
  const { t, i18n } = useTranslation();
  const bump = useSession((s) => s.bump);
  const params = useLocalSearchParams<{ id?: string; table?: 'exams' | 'deadlines'; subjectId?: string }>();
  const editing = !!params.id && !!params.table;
  const [kind, setKind] = useState<AgendaKind>('exam');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(params.subjectId || null);
  const [day, setDay] = useState(clock.today());
  const [hasTime, setHasTime] = useState(false);
  const [minute, setMinute] = useState(9 * 60);
  const [priority, setPriority] = useState<Priority>('medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { data: subjects = [] } = useAsync(() => repos().subjects.list('active'), []);

  useEffect(() => {
    if (!editing) return;
    void repos()
      .agenda.get(params.table!, params.id!)
      .then((i) => {
        if (!i) return;
        setKind(i.kind);
        setTitle(i.title);
        setSubjectId(i.subjectId);
        setDay(i.day);
        setHasTime(i.minute != null);
        if (i.minute != null) setMinute(i.minute);
        setPriority(i.priority);
        setNotes(i.notes);
      });
  }, [editing, params.id, params.table]);

  // When editing, the kind can only change within the same family (exams vs deadlines are separate tables).
  const kinds: AgendaKind[] = editing ? [...(params.table === 'exams' ? EXAM_KINDS : DEADLINE_KINDS)] : [...EXAM_KINDS, ...DEADLINE_KINDS];

  const save = async () => {
    if (!title.trim()) return setError(t('validation.required'));
    const input = { kind, title, subjectId, day, minute: hasTime ? minute : null, priority, notes };
    if (editing) await repos().agenda.update(params.table!, params.id!, input);
    else {
      const created = await repos().agenda.create(input);
      if (tableForKind(kind) === 'exams') {
        // Sensible default checklist for exams; editable afterwards.
        for (const key of ['checkSyllabus', 'checkSummaries', 'checkFlashcards', 'checkMockExam']) await repos().agenda.addChecklistItem('exams', created.id, t(`templateLabels.${key}`));
      }
    }
    await rescheduleAll(repos(), i18n.t);
    bump();
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="agenda-save" />}>
      <RouterStack.Screen options={{ title: editing ? t('agenda.edit') : t('agenda.new') }} />
      <Stack gap={2}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('agenda.type')}
        </Text>
        <Row gap={2} wrap>
          {kinds.map((k) => (
            <Chip key={k} label={t(`agenda.kinds.${k}`)} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </Row>
      </Stack>
      <TextField label={t('agenda.fields.title')} value={title} onChangeText={(v) => (setTitle(v), setError(null))} error={error} maxLength={100} testID="agenda-title" />
      <SubjectPicker label={t('common.subject')} subjects={subjects} value={subjectId} onChange={setSubjectId} />
      <DayField label={t('agenda.fields.day')} value={day} onChange={(d) => d && setDay(d)} />
      <ToggleRow title={t('agenda.fields.hasTime')} value={hasTime} onChange={setHasTime} />
      {hasTime ? <TimeField label={t('agenda.fields.time')} value={minute} onChange={setMinute} /> : null}
      <Stack gap={2}>
        <Text variant="bodySmall" style={{ fontWeight: '600' }}>
          {t('agenda.fields.priority')}
        </Text>
        <Row gap={2}>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <Chip key={p} label={t(`agenda.priority.${p}`)} selected={priority === p} onPress={() => setPriority(p)} />
          ))}
        </Row>
      </Stack>
      <TextField label={t('agenda.notes')} value={notes} onChangeText={setNotes} multiline maxLength={1000} />
    </Screen>
  );
}
