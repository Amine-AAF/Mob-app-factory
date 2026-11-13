import { Button, EmptyState, Row, Screen, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isActive, sortEvents } from '@/domain/events';
import { EventPicker } from '@/features/EventPicker';
import { TaskBoard } from '@/features/TaskBoard';
import { useRepo } from '@/hooks/useData';
import { clock } from '@/services/clock';

/** All tasks of active events, or of one event. */
export default function TasksTab() {
  const { t } = useTranslation();
  const [eventId, setEventId] = useState<string | null>(null);
  const { data } = useRepo(async (r) => ({ events: await r.events.list(), tasks: await r.tasks.listAll() }), []);
  const active = sortEvents(data?.events ?? [], clock.now()).filter((e) => isActive(e.status));
  const ids = new Set(active.map((e) => e.id));
  const tasks = (data?.tasks ?? []).filter((x) => (eventId ? x.eventId === eventId : ids.has(x.eventId)));
  const names = new Map(active.map((e) => [e.id, e.name]));
  const target = eventId ?? active[0]?.id;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title">{t('tasks.title')}</Text>
        {target ? <Button size="md" label={t('tasks.add')} icon="add" onPress={() => router.push({ pathname: '/event/[id]/task', params: { id: target } })} /> : null}
      </Row>
      {!data ? null : active.length === 0 ? (
        <EmptyState icon="checkbox-outline" title={t('guests.noEventTitle')} message={t('tasks.noEventBody')} />
      ) : (
        <>
          {active.length > 1 ? <EventPicker events={active} value={eventId} onChange={setEventId} allLabel={t('tasks.allEvents')} /> : null}
          <TaskBoard tasks={tasks} eventNames={eventId ? undefined : names} />
        </>
      )}
    </Screen>
  );
}
