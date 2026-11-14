import { Button, Card, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips, DateField, SelectField, Stepper, TextField, ToggleRow } from '@/components/forms';
import { confirmDelete, limitAlert, Notice, ScreenTitle } from '@/components/ui';
import { canAddGuests } from '@/config/limits';
import { repos } from '@/database';
import { findDuplicates, fullName, validateGuest } from '@/domain/guests';
import { GUEST_CATEGORIES, RSVP_STATUSES, type GuestCategory, type GuestInput, type RsvpRecord, type RsvpStatus } from '@/domain/types';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

/** Add / edit a guest. Contact and dietary fields are private (never in notifications or ads). */
export default function GuestForm() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { id: eventId, guestId } = useLocalSearchParams<{ id: string; guestId?: string }>();
  const { data: snap } = useSnapshot(eventId);
  const [form, setForm] = useState<GuestInput>({
    eventId,
    groupId: null,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    category: 'friend',
    plusOnes: 0,
    children: 0,
    isChild: false,
    dietary: '',
    notes: '',
    rsvpStatus: 'not_invited',
    rsvpRespondedAt: null,
    rsvpNote: '',
  });
  const [history, setHistory] = useState<RsvpRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!guestId) return;
    const r = repos();
    void r.guests.get(guestId).then((g) => {
      if (!g) return;
      const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = g;
      setForm(rest);
    });
    void r.guests.history(guestId).then(setHistory);
  }, [guestId]);

  const patch = (p: Partial<GuestInput>) => setForm((f) => ({ ...f, ...p }));
  const duplicates = useMemo(() => (snap ? findDuplicates({ ...form, id: guestId }, snap.guests) : []), [snap, form, guestId]);
  const err = (k: string) => (errors.includes(k) ? t(`errors.guest.${k}`) : null);

  const save = async (addAnother = false) => {
    const errs = validateGuest(form);
    setErrors(errs);
    if (errs.length || !snap) return;
    setSaving(true);
    try {
      if (guestId) {
        const before = snap.guests.find((g) => g.id === guestId);
        const { rsvpStatus, rsvpNote, rsvpRespondedAt, ...rest } = form;
        await mutate(async (r) => {
          await r.guests.update(guestId, rest);
          if (before && (before.rsvpStatus !== rsvpStatus || before.rsvpNote !== rsvpNote || before.rsvpRespondedAt !== rsvpRespondedAt)) {
            await r.guests.setRsvp(guestId, rsvpStatus, { note: rsvpNote, respondedAt: rsvpRespondedAt });
          }
        });
        router.back();
      } else {
        const check = canAddGuests(isPremium, snap.guests.length);
        if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'guests_limit');
        await mutate((r) => r.guests.add(form));
        if (addAnother) {
          setForm((f) => ({ ...f, firstName: '', lastName: '', phone: '', email: '', plusOnes: 0, children: 0, isChild: false, dietary: '', notes: '', rsvpNote: '' }));
          setErrors([]);
        } else router.back();
      }
    } catch {
      Alert.alert(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const groups = snap?.groups ?? [];

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {!guestId ? (
            <Stack style={{ flex: 1 }}>
              <Button variant="secondary" label={t('guests.saveAndAdd')} onPress={() => save(true)} disabled={saving} />
            </Stack>
          ) : null}
          <Stack style={{ flex: 1 }}>
            <Button label={t('common.save')} onPress={() => save(false)} loading={saving} testID="guest-save" />
          </Stack>
        </Row>
      }
    >
      <ScreenTitle title={guestId ? t('guests.edit') : t('guests.add')} />
      {duplicates.length ? (
        <Notice icon="copy-outline" tone="warning" title={t('guests.duplicates.possible')}>
          {duplicates.map((d) => `${fullName(snap?.guests.find((g) => g.id === d.guestId) ?? { firstName: '', lastName: '' })} (${t(`guests.duplicates.reason.${d.reason}`)})`).join(', ')}
        </Notice>
      ) : null}
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('guest.firstName')} value={form.firstName} onChangeText={(firstName) => patch({ firstName })} error={err('name')} autoCapitalize="words" testID="guest-first" />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('guest.lastName')} value={form.lastName} onChangeText={(lastName) => patch({ lastName })} autoCapitalize="words" />
        </Stack>
      </Row>
      <ChoiceChips<GuestCategory> label={t('guest.category')} value={form.category} onChange={(category) => patch({ category })} options={GUEST_CATEGORIES.map((c) => ({ value: c, label: t(`guestCategory.${c}`) }))} />
      <SelectField
        label={t('guest.group')}
        value={form.groupId}
        optional
        placeholder={t('guests.noGroup')}
        options={groups.map((g) => ({ value: g.id, label: g.name, hint: t(`groupKind.${g.kind}`) }))}
        onChange={(groupId) => patch({ groupId })}
        icon="people-circle-outline"
      />
      {groups.length === 0 ? <Button size="md" variant="ghost" label={t('groups.create')} onPress={() => router.push({ pathname: '/event/[id]/groups', params: { id: eventId } })} /> : null}

      <Card>
        <Stepper label={t('guest.plusOnes')} hint={t('guest.plusOnesHint')} value={form.plusOnes} onChange={(plusOnes) => patch({ plusOnes })} max={20} />
        <Stepper label={t('guest.children')} hint={t('guest.childrenHint')} value={form.children} onChange={(children) => patch({ children })} max={20} />
        <ToggleRow label={t('guest.isChild')} value={form.isChild} onChange={(isChild) => patch({ isChild })} />
        <Text variant="caption" tone="subtle">
          {t('guest.partyTotal', { count: 1 + form.plusOnes + form.children })}
        </Text>
      </Card>

      <SectionHeader title={t('guest.rsvp')} />
      <ChoiceChips<RsvpStatus> value={form.rsvpStatus} onChange={(rsvpStatus) => patch({ rsvpStatus })} options={RSVP_STATUSES.map((s) => ({ value: s, label: t(`rsvp.${s}`) }))} />
      <DateField label={t('rsvp.respondedOn')} value={form.rsvpRespondedAt} onChange={(rsvpRespondedAt) => patch({ rsvpRespondedAt })} optional />
      <TextField label={t('rsvp.note')} value={form.rsvpNote} onChangeText={(rsvpNote) => patch({ rsvpNote })} />

      <SectionHeader title={t('guest.private')} />
      <Text variant="caption" tone="subtle">
        {t('guest.privateHint')}
      </Text>
      <TextField label={t('guest.phone')} value={form.phone} onChangeText={(phone) => patch({ phone })} keyboardType="phone-pad" secureHint />
      <TextField label={t('guest.email')} value={form.email} onChangeText={(email) => patch({ email })} keyboardType="email-address" autoCapitalize="none" error={err('email')} secureHint />
      <TextField label={t('guest.dietary')} value={form.dietary} onChangeText={(dietary) => patch({ dietary })} placeholder={t('guest.dietaryPlaceholder')} secureHint />
      <TextField label={t('guest.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline secureHint />

      {history.length ? (
        <>
          <SectionHeader title={t('rsvp.history')} />
          <Card>
            {history.map((h) => (
              <Text key={h.id} variant="bodySmall" tone="muted">
                {`${fmt.instant(h.recordedAt)} · ${t(`rsvp.${h.status}`)} · ${t(`rsvpSource.${h.source}`)}${h.note ? ` · ${h.note}` : ''}`}
              </Text>
            ))}
          </Card>
        </>
      ) : null}

      {guestId ? (
        <Button
          variant="danger"
          label={t('guests.delete')}
          onPress={() => confirmDelete(t, fullName(form), () => void mutate((r) => r.guests.remove(guestId)).then(() => router.back()))}
        />
      ) : null}
    </Screen>
  );
}
