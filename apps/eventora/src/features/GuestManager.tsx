import { Badge, Button, Card, EmptyState, Icon, Row, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ChoiceChips, MultiChips, TextField, ToggleRow } from '@/components/forms';
import { limitAlert, Notice, StatusBadge } from '@/components/ui';
import { canAddGuests } from '@/config/limits';
import { duplicateClusters, filterGuests, fullName, partySize, rsvpStats, sortGuests } from '@/domain/guests';
import { RSVP_STATUSES, type Guest, type RsvpStatus } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

/** Quick RSVP change menu (shared by the guest list and the RSVP tracker). */
export function rsvpMenu(t: TFunction, guest: Guest) {
  const options: RsvpStatus[] = ['invited', 'confirmed', 'declined', 'maybe', 'no_response', 'not_invited'];
  Alert.alert(fullName(guest), t('rsvp.changeTitle'), [
    ...options
      .filter((s) => s !== guest.rsvpStatus)
      .slice(0, 5)
      .map((s) => ({ text: t(`rsvp.${s}`), onPress: () => void mutate((r) => r.guests.setRsvp(guest.id, s)) })),
    { text: t('common.cancel'), style: 'cancel' as const },
  ]);
}

export function GuestRow({ guest, groupName, onPress, onStatus }: { guest: Guest; groupName?: string; onPress: () => void; onStatus: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const size = partySize(guest);
  const extras = [groupName, size > 1 ? t('guest.partyOf', { count: size }) : null, guest.isChild ? t('guest.child') : null, guest.dietary ? t('guest.hasDietary') : null].filter(Boolean).join(' · ');
  return (
    <Row gap={3} style={{ minHeight: 60, paddingVertical: 6 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${fullName(guest)}, ${t(`rsvp.${guest.rsvpStatus}`)}`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="subheading" tone="primary">
            {(guest.firstName[0] ?? guest.lastName[0] ?? '?').toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1}>{fullName(guest) || t('guest.unnamed')}</Text>
          {extras ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {extras}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <Pressable onPress={onStatus} accessibilityRole="button" accessibilityLabel={t('rsvp.changeTitle')} hitSlop={6}>
        <StatusBadge kind="rsvp" status={guest.rsvpStatus} />
      </Pressable>
    </Row>
  );
}

export function GuestManager({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { data: snap } = useSnapshot(eventId);
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<RsvpStatus[]>([]);
  const [groupId, setGroupId] = useState<string>('any');
  const [withChildren, setWithChildren] = useState(false);
  const [sort, setSort] = useState<'name' | 'status' | 'recent'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const guests = useMemo(() => snap?.guests ?? [], [snap]);
  const groups = useMemo(() => new Map((snap?.groups ?? []).map((g) => [g.id, g.name])), [snap]);
  const stats = rsvpStats(guests);
  const clusters = useMemo(() => duplicateClusters(guests), [guests]);
  const shown = sortGuests(
    filterGuests(guests, { query, statuses, groupId: groupId === 'any' ? undefined : groupId === 'none' ? null : groupId, onlyWithChildren: withChildren }),
    sort,
  );

  if (!snap) return null;

  const add = () => {
    const check = canAddGuests(isPremium, guests.length);
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'guests_limit');
    router.push({ pathname: '/event/[id]/guest', params: { id: eventId } });
  };

  const reviewDuplicates = () => {
    const first = clusters[0];
    if (!first) return;
    const [keepId, ...others] = first;
    const keep = guests.find((g) => g.id === keepId);
    const drop = guests.find((g) => g.id === others[0]);
    if (!keep || !drop) return;
    Alert.alert(t('guests.duplicates.title'), t('guests.duplicates.mergeBody', { a: fullName(keep), b: fullName(drop) }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('guests.duplicates.open'), onPress: () => router.push({ pathname: '/event/[id]/guest', params: { id: eventId, guestId: drop.id } }) },
      { text: t('guests.duplicates.merge'), onPress: () => void mutate((r) => r.guests.merge(keep.id, drop.id)) },
    ]);
  };

  return (
    <Stack gap={3}>
      <Card tone="alt">
        <Row style={{ justifyContent: 'space-around' }}>
          {[
            [stats.entries, t('guests.entries')],
            [stats.expected.total, t('rsvp.stats.expected')],
            [stats.confirmed, t('rsvp.confirmed')],
            [stats.pending, t('rsvp.stats.pending')],
          ].map(([n, label]) => (
            <View key={String(label)} style={{ alignItems: 'center' }} accessible accessibilityLabel={`${label}: ${n}`}>
              <Text variant="heading">{fmt.number(Number(n))}</Text>
              <Text variant="caption" tone="muted">
                {label}
              </Text>
            </View>
          ))}
        </Row>
        <Text variant="caption" tone="subtle" center>
          {t('rsvp.stats.breakdown', { adults: stats.expected.adults, children: stats.expected.children, rate: fmt.percent(stats.responseRate) })}
        </Text>
      </Card>

      <Row gap={2} wrap>
        <Button size="md" label={t('guests.add')} icon="person-add" onPress={add} testID="guest-add" />
        <Button size="md" variant="secondary" label={t('guests.import')} icon="document-text-outline" onPress={() => router.push({ pathname: '/event/[id]/import', params: { id: eventId } })} />
        <Button size="md" variant="secondary" label={t('guests.groups')} icon="people-circle-outline" onPress={() => router.push({ pathname: '/event/[id]/groups', params: { id: eventId } })} />
        <Button size="md" variant="secondary" label={t('rsvp.title')} icon="checkmark-done-outline" onPress={() => router.push({ pathname: '/event/[id]/rsvp', params: { id: eventId } })} />
      </Row>

      {clusters.length ? (
        <Pressable onPress={reviewDuplicates} accessibilityRole="button">
          <Notice icon="copy-outline" tone="warning" title={t('guests.duplicates.found', { count: clusters.length })}>
            {t('guests.duplicates.tap')}
          </Notice>
        </Pressable>
      ) : null}

      <TextField label={t('common.search')} value={query} onChangeText={setQuery} placeholder={t('guests.searchPlaceholder')} testID="guest-search" />
      <Pressable onPress={() => setShowFilters((v) => !v)} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="options-outline" size={18} color={theme.colors.primary} />
        <Text tone="primary" style={{ fontWeight: '700' }}>
          {t('guests.filters')}
        </Text>
        {statuses.length || groupId !== 'any' || withChildren ? <Badge label={String(statuses.length + (groupId !== 'any' ? 1 : 0) + (withChildren ? 1 : 0))} /> : null}
      </Pressable>
      {showFilters ? (
        <Card>
          <MultiChips values={statuses} onChange={setStatuses} options={RSVP_STATUSES.map((s) => ({ value: s, label: t(`rsvp.${s}`) }))} />
          <ChoiceChips
            label={t('guest.group')}
            value={groupId}
            onChange={setGroupId}
            options={[{ value: 'any', label: t('guests.allGroups') }, { value: 'none', label: t('guests.noGroup') }, ...[...groups].map(([value, label]) => ({ value, label }))]}
          />
          <ToggleRow label={t('guests.withChildren')} value={withChildren} onChange={setWithChildren} />
          <ChoiceChips label={t('guests.sort')} value={sort} onChange={setSort} options={(['name', 'status', 'recent'] as const).map((s) => ({ value: s, label: t(`guests.sortBy.${s}`) }))} />
        </Card>
      ) : null}

      {guests.length === 0 ? (
        <EmptyState icon="people-outline" title={t('guests.emptyTitle')} message={t('guests.emptyBody')} />
      ) : shown.length === 0 ? (
        <Text tone="muted" center>
          {t('common.noResults')}
        </Text>
      ) : (
        <Card>
          <Text variant="caption" tone="subtle">
            {t('guests.showing', { count: shown.length, total: guests.length })}
          </Text>
          {shown.map((g) => (
            <GuestRow
              key={g.id}
              guest={g}
              groupName={g.groupId ? groups.get(g.groupId) : undefined}
              onPress={() => router.push({ pathname: '/event/[id]/guest', params: { id: eventId, guestId: g.id } })}
              onStatus={() => rsvpMenu(t, g)}
            />
          ))}
        </Card>
      )}
      {!isPremium && guests.length > 0 ? (
        <Text variant="caption" tone="subtle" center>
          {t('guests.freeLimit', { count: guests.length, limit: 150 })}
        </Text>
      ) : null}
    </Stack>
  );
}
