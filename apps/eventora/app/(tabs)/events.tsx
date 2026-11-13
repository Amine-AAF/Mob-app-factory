import { Button, EmptyState, Row, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceChips, TextField } from '@/components/forms';
import { AdBanner, EventCard, limitAlert } from '@/components/ui';
import { canCreateEvent } from '@/config/limits';
import { countActive, eventPhase, isActive, sortEvents } from '@/domain/events';
import { normalizeText } from '@/domain/guests';
import { useRepo } from '@/hooks/useData';
import { clock } from '@/services/clock';
import { useIsPremium } from '@/store/session';

type Filter = 'active' | 'past' | 'cancelled' | 'all';

export default function MyEvents() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [filter, setFilter] = useState<Filter>('active');
  const [q, setQ] = useState('');
  const { data } = useRepo(async (r) => {
    const [events, counts] = await Promise.all([
      r.events.list(),
      r.db.getAllAsync<{ event_id: string; n: number; confirmed: number }>("SELECT event_id, COUNT(*) AS n, SUM(CASE WHEN rsvp_status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed FROM guests GROUP BY event_id", []),
    ]);
    return { events, counts: new Map(counts.map((c) => [c.event_id, c])) };
  }, []);

  const now = clock.now();
  const events = sortEvents(data?.events ?? [], now).filter((e) => {
    if (q && !normalizeText(`${e.name} ${e.venue}`).includes(normalizeText(q))) return false;
    if (filter === 'active') return isActive(e.status);
    if (filter === 'past') return e.status === 'completed' || (isActive(e.status) && eventPhase(e, now) === 'past');
    if (filter === 'cancelled') return e.status === 'cancelled';
    return true;
  });

  const create = () => {
    const check = canCreateEvent(isPremium, countActive(data?.events ?? []));
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'events_limit');
    router.push('/event/new');
  };

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title">{t('events.title')}</Text>
        <Button size="md" label={t('events.new')} icon="add" onPress={create} testID="events-new" />
      </Row>
      <ChoiceChips
        value={filter}
        onChange={setFilter}
        options={(['active', 'past', 'cancelled', 'all'] as const).map((f) => ({ value: f, label: t(`events.filter.${f}`) }))}
      />
      {(data?.events.length ?? 0) > 4 ? <TextField label={t('common.search')} value={q} onChangeText={setQ} placeholder={t('events.searchPlaceholder')} /> : null}
      {events.length === 0 ? (
        <EmptyState icon="calendar-outline" title={t('events.emptyTitle')} message={t('events.emptyBody')} action={<Button label={t('templates.browse')} variant="secondary" onPress={() => router.push('/templates')} />} />
      ) : (
        <Stack gap={3}>
          {events.map((e) => {
            const c = data?.counts.get(e.id);
            return <EventCard key={e.id} event={e} subtitle={c ? t('events.guestLine', { count: c.n, confirmed: c.confirmed }) : undefined} onPress={() => router.push(`/event/${e.id}`)} />;
          })}
        </Stack>
      )}
      <Button label={t('templates.browse')} variant="ghost" icon="albums-outline" onPress={() => router.push('/templates')} />
      <AdBanner />
    </Screen>
  );
}
