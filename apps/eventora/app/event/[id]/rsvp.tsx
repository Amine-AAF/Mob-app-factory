import { Button, Card, EmptyState, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ChoiceChips } from '@/components/forms';
import { Bars, Kpi, KpiGrid, Notice, ScreenTitle, StatusBadge } from '@/components/ui';
import { fullName, isPending, partySize, rsvpStats, sortGuests } from '@/domain/guests';
import type { Guest, RsvpStatus } from '@/domain/types';
import { exportReport } from '@/features/exporter';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

type View_ = 'pending' | 'confirmed' | 'declined' | 'not_invited' | 'all';

function QuickRsvp({ guest }: { guest: Guest }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const btn = (status: RsvpStatus, icon: 'checkmark' | 'close' | 'help', color: string) => (
    <Pressable
      onPress={() => void mutate((r) => r.guests.setRsvp(guest.id, status))}
      accessibilityRole="button"
      accessibilityLabel={`${fullName(guest)}: ${t(`rsvp.${status}`)}`}
      accessibilityState={{ selected: guest.rsvpStatus === status }}
      style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: guest.rsvpStatus === status ? color : theme.colors.surfaceAlt }}
    >
      <Icon name={icon} size={20} color={guest.rsvpStatus === status ? '#FFFFFF' : color} />
    </Pressable>
  );
  return (
    <Row gap={2}>
      {btn('confirmed', 'checkmark', theme.colors.success)}
      {btn('maybe', 'help', theme.colors.warning)}
      {btn('declined', 'close', theme.colors.danger)}
    </Row>
  );
}

/** RSVP tracker. Answers are recorded manually (phone, message, in person): Eventora never collects replies automatically. */
export default function RsvpTracker() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [view, setView] = useState<View_>('pending');
  if (!snap) return null;
  const s = rsvpStats(snap.guests);
  const list = sortGuests(
    snap.guests.filter((g) => (view === 'all' ? true : view === 'pending' ? isPending(g.rsvpStatus) : g.rsvpStatus === view)),
    'name',
  );
  const notInvited = snap.guests.filter((g) => g.rsvpStatus === 'not_invited');

  const markAllInvited = () =>
    Alert.alert(t('rsvp.markInvitedTitle'), t('rsvp.markInvitedBody', { count: notInvited.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: () => void mutate((r) => r.guests.bulkSetRsvp(notInvited.map((g) => g.id), 'invited')) },
    ]);

  const exportList = () =>
    Alert.alert(t('rsvp.export'), undefined, [
      { text: 'PDF', onPress: () => void exportReport({ t, snap, kind: 'rsvp', format: 'pdf', isPremium }) },
      { text: 'CSV', onPress: () => void exportReport({ t, snap, kind: 'guests', format: 'csv', isPremium }) },
      { text: t('common.cancel'), style: 'cancel' },
    ]);

  return (
    <Screen edges={[]}>
      <ScreenTitle title={t('rsvp.title')} />
      <KpiGrid>
        <Kpi icon="paper-plane" value={fmt.number(s.contacted)} label={t('rsvp.stats.contacted')} />
        <Kpi icon="checkmark-circle" tone="success" value={fmt.number(s.confirmed)} label={t('rsvp.stats.confirmed')} />
        <Kpi icon="close-circle" tone="danger" value={fmt.number(s.declined)} label={t('rsvp.stats.declined')} />
        <Kpi icon="hourglass" tone="warning" value={fmt.number(s.pending)} label={t('rsvp.stats.pending')} />
        <Kpi icon="people" value={fmt.number(s.expected.total)} label={t('rsvp.stats.expected')} />
        <Kpi icon="person-add" tone="accent" value={fmt.number(s.companions)} label={t('rsvp.stats.companions')} />
      </KpiGrid>
      <Card>
        <Bars
          rows={[
            { label: t('rsvp.confirmed'), value: s.confirmed, display: fmt.number(s.confirmed), max: s.entries, tone: 'success' },
            { label: t('rsvp.maybe'), value: s.maybe, display: fmt.number(s.maybe), max: s.entries, tone: 'accent' },
            { label: t('rsvp.declined'), value: s.declined, display: fmt.number(s.declined), max: s.entries, tone: 'danger' },
            { label: t('rsvp.stats.pending'), value: s.pending, display: fmt.number(s.pending), max: s.entries },
          ]}
        />
        <Text variant="caption" tone="subtle">
          {t('rsvp.stats.breakdown', { adults: s.expected.adults, children: s.expected.children, rate: fmt.percent(s.responseRate) })}
        </Text>
      </Card>
      <Notice icon="information-circle">{t('rsvp.manualNote')}</Notice>
      <Row gap={2} wrap>
        {notInvited.length ? <Button size="md" variant="secondary" icon="paper-plane-outline" label={t('rsvp.markInvited', { count: notInvited.length })} onPress={markAllInvited} /> : null}
        <Button size="md" variant="secondary" icon="mail-open-outline" label={t('modules.invitations')} onPress={() => router.push({ pathname: '/event/[id]/invitation', params: { id } })} />
        <Button size="md" variant="secondary" icon="share-outline" label={t('rsvp.export')} onPress={exportList} />
      </Row>
      <ChoiceChips<View_>
        value={view}
        onChange={setView}
        options={[
          { value: 'pending', label: `${t('rsvp.stats.pending')} (${s.pending})` },
          { value: 'confirmed', label: `${t('rsvp.confirmed')} (${s.confirmed})` },
          { value: 'declined', label: `${t('rsvp.declined')} (${s.declined})` },
          { value: 'not_invited', label: `${t('rsvp.not_invited')} (${s.notInvited})` },
          { value: 'all', label: t('common.all') },
        ]}
      />
      {list.length === 0 ? (
        <EmptyState icon="checkmark-done" title={view === 'pending' ? t('rsvp.allAnswered') : t('common.noResults')} />
      ) : (
        <>
          <SectionHeader title={t('rsvp.listTitle', { count: list.length })} />
          <Card>
            {list.map((g) => (
              <Row key={g.id} gap={2} style={{ minHeight: 60 }}>
                <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/event/[id]/guest', params: { id, guestId: g.id } })} accessibilityRole="button">
                  <Text numberOfLines={1}>{fullName(g)}</Text>
                  <Stack gap={1} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <StatusBadge kind="rsvp" status={g.rsvpStatus} />
                    <Text variant="caption" tone="muted">
                      {`  ${partySize(g) > 1 ? `+${partySize(g) - 1}` : ''}${g.rsvpRespondedAt ? ` · ${fmt.dayShort(g.rsvpRespondedAt)}` : ''}`}
                    </Text>
                  </Stack>
                  {g.rsvpNote ? (
                    <Text variant="caption" tone="subtle" numberOfLines={1}>
                      {g.rsvpNote}
                    </Text>
                  ) : null}
                </Pressable>
                <View>
                  <QuickRsvp guest={g} />
                </View>
              </Row>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
