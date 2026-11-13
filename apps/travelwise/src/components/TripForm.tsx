import { Button, Card, IconButton, Row, Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CURRENCY_CODES, isCurrencyCode, type CurrencyCode } from '@/constants/currencies';
import { TRIP_STATUSES, TRIP_TYPES, type TripStatus, type TripType } from '@/constants/domain';
import { TripValidationError, type TripDetails, type TripInput } from '@/database/repositories/trips';
import { recordError } from '@/services/analytics';
import { fromMinor, parseAmount } from '@/utils/money';

import { ChoiceChips } from './Choice';
import { DateField } from './DateField';
import { TextField } from './TextField';

interface DestinationDraft {
  id?: string;
  city: string;
  countryCode: string;
  timeZone: string;
  startDate: string;
  endDate: string;
}

const emptyDestination = (): DestinationDraft => ({ city: '', countryCode: '', timeZone: '', startDate: '', endDate: '' });

/** Statuses the user can pick; ongoing/completed are derived from the dates. */
const EDITABLE_STATUSES: readonly TripStatus[] = TRIP_STATUSES.filter((s) => s === 'planning' || s === 'upcoming');

export function TripForm({
  initial,
  defaultCurrency,
  submitLabel,
  onSubmit,
  onDone,
}: {
  initial?: TripDetails;
  defaultCurrency: CurrencyCode;
  submitLabel: string;
  onSubmit: (input: TripInput) => Promise<unknown>;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [destinations, setDestinations] = useState<DestinationDraft[]>(
    initial?.destinations.length
      ? initial.destinations.map((d) => ({ id: d.id, city: d.city, countryCode: d.countryCode ?? '', timeZone: d.timeZone ?? '', startDate: d.startDate ?? '', endDate: d.endDate ?? '' }))
      : [emptyDestination()],
  );
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [tripType, setTripType] = useState<TripType>(initial?.tripType ?? 'solo');
  const [status, setStatus] = useState<TripStatus>(initial && EDITABLE_STATUSES.includes(initial.status) ? initial.status : 'planning');
  const [currency, setCurrency] = useState<CurrencyCode>(initial && isCurrencyCode(initial.currency) ? initial.currency : defaultCurrency);
  const [budget, setBudget] = useState(initial?.budgetMinor != null ? String(fromMinor(initial.budgetMinor, initial.currency)) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [people, setPeople] = useState<{ id?: string; name: string; isSelf: boolean }[]>(initial?.participants.map((p) => ({ id: p.id, name: p.name, isSelf: p.isSelf })) ?? []);
  const [error, setError] = useState<{ code: string; field?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const errorFor = (field: string) => (error && error.field === field ? t(`tripForm.errors.${error.code}`) : null);
  const errorForPrefix = (prefix: string) => (error?.field?.startsWith(prefix) ? t(`tripForm.errors.${error.code}`) : null);
  const patchDest = (i: number, patch: Partial<DestinationDraft>) => setDestinations((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const submit = async () => {
    setError(null);
    const budgetMinor = budget.trim() ? parseAmount(budget, currency) : null;
    if (budget.trim() && budgetMinor === null) {
      setError({ code: 'invalid_budget', field: 'budget' });
      return;
    }
    const input: TripInput = {
      name,
      startDate: startDate.trim() || null,
      endDate: endDate.trim() || null,
      tripType,
      status,
      currency,
      budgetMinor,
      description,
      coverUri: initial?.coverUri ?? null,
      destinations: destinations
        .filter((d) => d.city.trim() || d.countryCode.trim() || d.timeZone.trim())
        .map((d) => ({ id: d.id, city: d.city, countryCode: d.countryCode || null, timeZone: d.timeZone || null, startDate: d.startDate || null, endDate: d.endDate || null })),
      participants: people,
    };
    setSaving(true);
    try {
      await onSubmit(input);
      onDone();
    } catch (e) {
      if (e instanceof TripValidationError) setError({ code: e.code, field: e.field });
      else {
        recordError(e, 'trip_form');
        setError({ code: 'generic', field: 'form' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={4}>
      <TextField label={t('tripForm.name')} placeholder={t('tripForm.namePlaceholder')} value={name} onChangeText={setName} maxLength={80} error={errorFor('name')} testID="trip-name" />

      <Stack gap={2}>
        <Text variant="heading">{t('tripForm.destinations')}</Text>
        <Text variant="caption" tone="subtle">
          {t('tripForm.destinationsHint')}
        </Text>
        {destinations.map((d, i) => (
          <Card key={d.id ?? `new-${i}`} tone="alt">
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="label">{`${i + 1}.`}</Text>
              {destinations.length > 1 ? (
                <IconButton icon="close" label={t('a11y.removeItem', { name: d.city || `${i + 1}` })} onPress={() => setDestinations((all) => all.filter((_, j) => j !== i))} />
              ) : null}
            </Row>
            <TextField label={t('tripForm.city')} placeholder={t('tripForm.cityPlaceholder')} value={d.city} onChangeText={(v) => patchDest(i, { city: v })} testID={`trip-city-${i}`} />
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              <Stack gap={0} style={{ flex: 1 }}>
                <TextField
                  label={t('tripForm.country')}
                  placeholder={t('tripForm.countryPlaceholder')}
                  autoCapitalize="characters"
                  maxLength={2}
                  value={d.countryCode}
                  onChangeText={(v) => patchDest(i, { countryCode: v.toUpperCase() })}
                  optional
                  optionalLabel={t('common.optional')}
                />
              </Stack>
              <Stack gap={0} style={{ flex: 1.4 }}>
                <TextField label={t('tripForm.timeZone')} placeholder={t('tripForm.timeZonePlaceholder')} autoCapitalize="none" autoCorrect={false} value={d.timeZone} onChangeText={(v) => patchDest(i, { timeZone: v })} />
              </Stack>
            </Row>
            {destinations.length > 1 ? (
              <Row gap={2} style={{ alignItems: 'flex-start' }}>
                <Stack gap={0} style={{ flex: 1 }}>
                  <DateField label={t('tripForm.startDate')} value={d.startDate || null} min={startDate || null} max={endDate || null} optional onChange={(v) => patchDest(i, { startDate: v ?? '' })} />
                </Stack>
                <Stack gap={0} style={{ flex: 1 }}>
                  <DateField label={t('tripForm.endDate')} value={d.endDate || null} min={d.startDate || startDate || null} max={endDate || null} optional onChange={(v) => patchDest(i, { endDate: v ?? '' })} />
                </Stack>
              </Row>
            ) : null}
            {errorForPrefix(`destinations.${i}`) ? (
              <Text variant="caption" tone="danger">
                {errorForPrefix(`destinations.${i}`)}
              </Text>
            ) : null}
          </Card>
        ))}
        <Text variant="caption" tone="subtle">
          {t('tripForm.timeZoneHint')}
        </Text>
        <Button label={t('tripForm.addDestination')} variant="ghost" icon="add" onPress={() => setDestinations((d) => [...d, emptyDestination()])} testID="trip-add-destination" />
      </Stack>

      <Stack gap={2}>
        <Text variant="heading">{t('tripForm.dates')}</Text>
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Stack gap={0} style={{ flex: 1 }}>
            <DateField label={t('tripForm.startDate')} value={startDate || null} optional onChange={(v) => setStartDate(v ?? '')} testID="trip-start" />
          </Stack>
          <Stack gap={0} style={{ flex: 1 }}>
            <DateField label={t('tripForm.endDate')} value={endDate || null} min={startDate || null} optional onChange={(v) => setEndDate(v ?? '')} testID="trip-end" />
          </Stack>
        </Row>
        {errorForPrefix('trip') ? (
          <Text variant="caption" tone="danger" testID="trip-date-error">
            {errorForPrefix('trip')}
          </Text>
        ) : null}
      </Stack>

      <ChoiceChips label={t('tripForm.type')} options={TRIP_TYPES} value={tripType} onChange={setTripType} labelOf={(v) => t(`enums.tripType.${v}`)} testID="trip-type" />
      <ChoiceChips label={t('tripForm.status')} options={EDITABLE_STATUSES} value={status} onChange={setStatus} labelOf={(v) => t(`enums.tripStatus.${v}`)} />

      <Stack gap={2}>
        <Text variant="heading">{t('tripForm.travellers')}</Text>
        <Text variant="caption" tone="subtle">
          {t('tripForm.travellersHint')}
        </Text>
        {people.map((p, i) => (
          <Row key={p.id ?? `p-${i}`} gap={2}>
            <Stack gap={0} style={{ flex: 1 }}>
              <TextField
                label={p.isSelf ? t('tripForm.me') : `${t('tripForm.travellerPlaceholder')} ${i + 1}`}
                placeholder={t('tripForm.travellerPlaceholder')}
                value={p.name}
                onChangeText={(v) => setPeople((all) => all.map((x, j) => (j === i ? { ...x, name: v } : x)))}
              />
            </Stack>
            <IconButton icon="close" label={t('a11y.removeItem', { name: p.name || `${i + 1}` })} onPress={() => setPeople((all) => all.filter((_, j) => j !== i))} />
          </Row>
        ))}
        <Button
          label={t('tripForm.addTraveller')}
          variant="ghost"
          icon="person-add-outline"
          onPress={() => setPeople((all) => [...all, { name: all.length === 0 ? t('tripForm.me') : '', isSelf: all.length === 0 }])}
        />
      </Stack>

      <ChoiceChips label={t('tripForm.currency')} options={CURRENCY_CODES} value={currency} onChange={setCurrency} labelOf={(c) => c} testID="trip-currency" />
      <TextField
        label={t('tripForm.budget')}
        keyboardType="decimal-pad"
        value={budget}
        onChangeText={setBudget}
        error={errorFor('budget')}
        optional
        optionalLabel={t('common.optional')}
        testID="trip-budget"
      />
      <TextField label={t('tripForm.description')} placeholder={t('tripForm.descriptionPlaceholder')} value={description} onChangeText={setDescription} multiline optional optionalLabel={t('common.optional')} />

      {error?.field === 'form' || error?.code === 'not_found' || error?.field === 'currency' ? (
        <Text tone="danger">{t(`tripForm.errors.${error.code}`)}</Text>
      ) : null}
      <Button label={submitLabel} onPress={submit} loading={saving} size="lg" testID="trip-submit" />
    </Stack>
  );
}
