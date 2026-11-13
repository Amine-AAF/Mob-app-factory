import { Button, Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { ChoiceChips, DateField, SelectField, TextField, TimeField } from '@/components/forms';
import { EventCover, limitAlert, ScreenTitle } from '@/components/ui';
import { canCreateEvent } from '@/config/limits';
import { EVENT_TYPES, eventType } from '@/content/eventTypes';
import { findTemplate } from '@/content/templates';
import { repos } from '@/database';
import { countActive, validateEvent } from '@/domain/events';
import { COMMON_CURRENCIES, minorToInput, parseAmount } from '@/domain/money';
import { COMMON_TIME_ZONES, deviceTimeZone, localToday, addDaysTo } from '@/domain/time';
import { EVENT_STATUSES, EVENT_THEMES, type EventInput, type EventStatus, type EventTheme, type EventTypeId } from '@/domain/types';
import { mutate } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { deleteOwnedFile } from '@/services/files';
import { pickImage } from '@/services/sharing';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';

/** Create or edit an event (`?id=` edits; `?templateId=` / `?customTemplateId=` pre-fill a new one). */
export default function EventForm() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const params = useLocalSearchParams<{ id?: string; templateId?: string; customTemplateId?: string; typeId?: string }>();
  const editing = !!params.id;
  const template = findTemplate(params.templateId);
  const defaultCurrency = usePreferences((s) => s.defaultCurrency) ?? 'USD';

  const [form, setForm] = useState<EventInput>(() => {
    const typeId = (template?.typeId ?? (params.typeId as EventTypeId | undefined) ?? 'birthday') as EventTypeId;
    return {
      name: '',
      typeId,
      coverUri: null,
      description: '',
      startDate: addDaysTo(localToday(clock.now()), 60),
      startTime: template?.startTime ?? '18:00',
      endDate: null,
      endTime: template ? (template.endTime > '23:59' ? null : template.endTime) : null,
      timezone: deviceTimeZone(),
      venue: '',
      address: '',
      expectedGuests: template?.expectedGuests ?? 30,
      budgetMinor: 0,
      currency: defaultCurrency,
      notes: '',
      status: 'planning',
      theme: eventType(typeId).theme,
      templateId: template?.id ?? params.customTemplateId ?? null,
    };
  });
  const [budgetText, setBudgetText] = useState('');
  const [guestsText, setGuestsText] = useState(String(form.expectedGuests));
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    repos()
      .events.get(params.id)
      .then((e) => {
        if (!e) return;
        const { id: _i, startUtc: _s, createdAt: _c, updatedAt: _u, ...rest } = e;
        setForm(rest);
        setBudgetText(minorToInput(e.budgetMinor, e.currency));
        setGuestsText(String(e.expectedGuests));
      })
      .catch(() => undefined);
  }, [params.id]);

  const patch = (p: Partial<EventInput>) => setForm((f) => ({ ...f, ...p }));
  const err = (k: string) => (errors.includes(k) ? t(`errors.event.${k}`) : null);
  const zones = [...new Set([deviceTimeZone(), form.timezone, ...COMMON_TIME_ZONES])].map((z) => ({ value: z, label: z.replace(/_/g, ' '), hint: fmt.zoneLabel(z, new Date(`${form.startDate}T12:00:00Z`)) }));

  const save = async () => {
    const budgetMinor = budgetText.trim() ? parseAmount(budgetText, form.currency) : 0;
    const expectedGuests = Number.parseInt(guestsText || '0', 10);
    const next = { ...form, budgetMinor: budgetMinor ?? -1, expectedGuests: Number.isFinite(expectedGuests) ? expectedGuests : -1 };
    const errs = validateEvent(next);
    setErrors(errs);
    if (errs.length) return;
    setSaving(true);
    try {
      if (editing && params.id) {
        await mutate((r) => r.events.update(params.id!, next));
        router.back();
      } else {
        const all = await repos().events.list();
        const check = canCreateEvent(isPremium, countActive(all));
        if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'events_limit');
        const created = await mutate((r) => r.events.create(next, { templateId: template?.id, customTemplateId: params.customTemplateId, t, today: localToday(clock.now()) }));
        track('event_created', { type: next.typeId, template: template?.id ?? (params.customTemplateId ? 'custom' : 'none') });
        usePreferences.getState().set({ lastEventId: created.id });
        router.replace(`/event/${created.id}`);
      }
    } catch {
      Alert.alert(t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const chooseCover = async () => {
    const uri = await pickImage('covers', [16, 9]);
    if (uri) {
      if (form.coverUri) deleteOwnedFile(form.coverUri);
      patch({ coverUri: uri });
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={editing ? t('common.save') : t('events.create')} onPress={save} loading={saving} testID="event-save" />}>
      <ScreenTitle title={editing ? t('events.edit') : t('events.new')} />
      {template ? (
        <Card tone="primary">
          <Row gap={2}>
            <Icon name={template.icon} size={18} color={theme.colors.primary} />
            <Text variant="subheading" style={{ flex: 1 }}>
              {t('events.fromTemplate', { name: t(`templates.items.${template.id}.name`) })}
            </Text>
          </Row>
          <Text variant="bodySmall" tone="muted">
            {t('events.templateWillAdd', { tasks: template.tasks.length, activities: template.timeline.length })}
          </Text>
        </Card>
      ) : !editing ? (
        <Button variant="secondary" size="md" icon="albums-outline" label={t('events.useTemplate')} onPress={() => router.push({ pathname: '/templates', params: { pick: '1' } })} />
      ) : null}

      <Pressable onPress={chooseCover} accessibilityRole="button" accessibilityLabel={t('event.cover')}>
        <EventCover event={form} height={140} />
        <Row gap={1} style={{ position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
          <Icon name="image-outline" size={16} color="#FFFFFF" />
          <Text variant="caption" style={{ color: '#FFFFFF' }}>
            {form.coverUri ? t('event.changeCover') : t('event.addCover')}
          </Text>
        </Row>
      </Pressable>
      {form.coverUri ? <Button size="md" variant="ghost" label={t('event.removeCover')} onPress={() => patch({ coverUri: null })} /> : null}

      <TextField label={t('event.name')} value={form.name} onChangeText={(name) => patch({ name })} error={err('name') ?? err('nameTooLong')} placeholder={t('event.namePlaceholder')} maxLength={120} testID="event-name" />
      <ChoiceChips<EventTypeId>
        label={t('event.type')}
        value={form.typeId}
        onChange={(typeId) => patch({ typeId, theme: eventType(typeId).theme })}
        options={EVENT_TYPES.map((x) => ({ value: x.id, label: t(`eventTypes.${x.id}`) }))}
        icons={Object.fromEntries(EVENT_TYPES.map((x) => [x.id, x.icon]))}
      />
      <ChoiceChips<EventTheme> label={t('event.theme')} value={form.theme} onChange={(th) => patch({ theme: th })} options={EVENT_THEMES.map((x) => ({ value: x, label: t(`themes.${x}`) }))} />

      <Stack gap={3}>
        <DateField label={t('event.startDate')} value={form.startDate} onChange={(d) => d && patch({ startDate: d })} />
        {err('startDate') ? <Text tone="danger">{err('startDate')}</Text> : null}
        <TimeField label={t('event.startTime')} value={form.startTime} onChange={(v) => patch({ startTime: v })} optional />
        <DateField label={t('event.endDate')} value={form.endDate} onChange={(d) => patch({ endDate: d })} optional />
        <TimeField label={t('event.endTime')} value={form.endTime} onChange={(v) => patch({ endTime: v })} optional />
        {err('endBeforeStart') ? <Text tone="danger">{err('endBeforeStart')}</Text> : null}
        <SelectField label={t('event.timezone')} value={form.timezone} options={zones} onChange={(z) => z && patch({ timezone: z })} searchable icon="globe-outline" />
        <Text variant="caption" tone="subtle">
          {t('event.timezoneHint')}
        </Text>
      </Stack>

      <TextField label={t('event.venue')} value={form.venue} onChangeText={(venue) => patch({ venue })} />
      <TextField label={t('event.address')} value={form.address} onChangeText={(address) => patch({ address })} multiline />
      <TextField label={t('event.expectedGuests')} value={guestsText} onChangeText={setGuestsText} keyboardType="number-pad" error={err('expectedGuests')} maxLength={6} />
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <Stack style={{ flex: 2 }}>
          <TextField label={t('event.budget')} value={budgetText} onChangeText={setBudgetText} keyboardType="decimal-pad" error={err('budget')} placeholder="0" />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <SelectField label={t('event.currency')} value={form.currency} options={COMMON_CURRENCIES.map((c) => ({ value: c, label: c }))} onChange={(c) => c && patch({ currency: c })} searchable icon="cash-outline" />
        </Stack>
      </Row>
      <TextField label={t('event.description')} value={form.description} onChangeText={(description) => patch({ description })} multiline maxLength={2000} />
      <TextField label={t('event.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} multiline maxLength={4000} />
      {editing ? (
        <ChoiceChips<EventStatus> label={t('event.status')} value={form.status} onChange={(status) => patch({ status })} options={EVENT_STATUSES.map((s) => ({ value: s, label: t(`eventStatus.${s}`) }))} />
      ) : null}
    </Screen>
  );
}
