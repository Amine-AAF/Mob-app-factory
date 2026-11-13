import { Button, EmptyState, Screen, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { isActive, sortEvents } from '@/domain/events';
import { EventPicker } from '@/features/EventPicker';
import { GuestManager } from '@/features/GuestManager';
import { useRepo } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';

/** Guests tab: the guest manager of the selected event (no ads on this screen). */
export default function GuestsTab() {
  const { t } = useTranslation();
  const lastEventId = usePreferences((s) => s.lastEventId);
  const set = usePreferences((s) => s.set);
  const { data: events } = useRepo((r) => r.events.list(), []);
  const active = sortEvents(events ?? [], clock.now()).filter((e) => isActive(e.status));
  const list = active.length ? active : sortEvents(events ?? [], clock.now());
  const selected = list.find((e) => e.id === lastEventId) ?? list[0] ?? null;

  return (
    <Screen>
      <Text variant="title">{t('guests.title')}</Text>
      {!events ? null : !selected ? (
        <EmptyState icon="people-outline" title={t('guests.noEventTitle')} message={t('guests.noEventBody')} action={<Button label={t('events.create')} onPress={() => router.push('/event/new')} />} />
      ) : (
        <>
          {list.length > 1 ? <EventPicker events={list} value={selected.id} onChange={(id) => set({ lastEventId: id })} /> : null}
          <GuestManager eventId={selected.id} />
        </>
      )}
    </Screen>
  );
}
