import { Button, Chip, Row, Screen, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TextField, TimeField, ToggleRow } from '@/components/forms';
import { confirmDelete, Notice, ScreenTitle } from '@/components/ui';
import { TIMELINE_LIBRARY } from '@/content/templates';
import type { EventSnapshot } from '@/database';
import { findOverlaps, spanLabel, toSpan } from '@/domain/timeline';
import type { TimelineInput } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';

export default function ActivityForm() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId?: string }>();
  const { data: snap } = useSnapshot(id);
  // Mount the form once the programme is loaded so its fields start from the saved activity.
  return snap ? <ActivityEditor id={id} itemId={itemId} snap={snap} /> : null;
}

function ActivityEditor({ id, itemId, snap }: { id: string; itemId?: string; snap: EventSnapshot }) {
  const { t } = useTranslation();
  const [existing] = useState(() => snap.timeline.find((i) => i.id === itemId) ?? null);
  const initialSpan = existing ? spanLabel(existing) : null;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [owner, setOwner] = useState(existing?.owner ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [start, setStart] = useState<string | null>(initialSpan?.start ?? '18:00');
  const [end, setEnd] = useState<string | null>(initialSpan?.end ?? '19:00');
  const [nextDay, setNextDay] = useState(initialSpan?.startNextDay ?? false);
  const [error, setError] = useState(false);

  const span = start && end ? toSpan(start, end, nextDay) : null;
  const conflicts = span && snap ? findOverlaps([...snap.timeline.filter((x) => x.id !== itemId), { id: '__new', ...span, sortOrder: 999 }]).filter((o) => o.a === '__new' || o.b === '__new') : [];
  const names = new Map((snap?.timeline ?? []).map((x) => [x.id, x.title]));

  const save = async () => {
    if (!title.trim() || !span) return setError(true);
    const input: TimelineInput = { eventId: id, title: title.trim(), description, location, owner, notes, startMin: span.startMin, endMin: span.endMin, sortOrder: snap?.timeline.length ?? 0 };
    try {
      if (itemId) await mutate((r) => r.timeline.update(itemId, input));
      else await mutate((r) => r.timeline.add(input));
      router.back();
    } catch {
      Alert.alert(t('errors.saveFailed'));
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="activity-save" />}>
      <ScreenTitle title={itemId ? t('timeline.edit') : t('timeline.add')} />
      <TextField label={t('timeline.activity')} value={title} onChangeText={setTitle} error={error && !title.trim() ? t('errors.task.title') : null} testID="activity-title" />
      {!itemId ? (
        <Row gap={2} wrap>
          {TIMELINE_LIBRARY.slice(0, 12).map((k) => (
            <Chip key={k} label={t(`timelineLibrary.${k}`)} selected={title === t(`timelineLibrary.${k}`)} onPress={() => setTitle(t(`timelineLibrary.${k}`))} />
          ))}
        </Row>
      ) : null}
      <TimeField label={t('timeline.start')} value={start} onChange={setStart} />
      <ToggleRow label={t('timeline.startsNextDay')} hint={t('timeline.startsNextDayHint')} value={nextDay} onChange={setNextDay} />
      <TimeField label={t('timeline.end')} value={end} onChange={setEnd} />
      {span && spanLabel(span).endNextDay && !nextDay ? (
        <Text variant="caption" tone="accent">
          {t('timeline.endsNextDay')}
        </Text>
      ) : null}
      {conflicts.length ? (
        <Notice tone="warning" icon="warning" title={t('timeline.conflict')}>
          {conflicts.map((o) => names.get(o.a === '__new' ? o.b : o.a) ?? '').join(', ')}
        </Notice>
      ) : null}
      <TextField label={t('timeline.location')} value={location} onChangeText={setLocation} />
      <TextField label={t('timeline.owner')} value={owner} onChangeText={setOwner} placeholder={t('task.assigneePlaceholder')} />
      <TextField label={t('timeline.description')} value={description} onChangeText={setDescription} multiline />
      <TextField label={t('task.notes')} value={notes} onChangeText={setNotes} multiline />
      {itemId ? <Button variant="danger" label={t('timeline.delete')} onPress={() => confirmDelete(t, title, () => void mutate((r) => r.timeline.remove(itemId)).then(() => router.back()))} /> : null}
    </Screen>
  );
}
