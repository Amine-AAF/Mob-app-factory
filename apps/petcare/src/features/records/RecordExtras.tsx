import { Badge, Button, Card, Divider, ListRow, Row, SectionHeader, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { TextField } from '@/components/fields';
import { StatusBadge } from '@/components/pet';
import { repos } from '@/database';
import { stockLevel, daysOfStockLeft } from '@/domain/care';
import { treatmentStatus } from '@/domain/health';
import { parseDecimal } from '@/domain/units';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { mutate } from '@/services/mutations';
import { usePreferences } from '@/store/preferences';

import type { RecordKind } from './specs';

/** Kind-specific actions shown under the edit form (log a dose, record a purchase…). */
export function RecordExtras({ kind, id, petId }: { kind: RecordKind; id: string; petId: string | null }) {
  switch (kind) {
    case 'treatment':
      return <TreatmentExtras id={id} />;
    case 'appointment':
      return <AppointmentExtras id={id} />;
    case 'health':
    case 'vaccination':
      return petId ? <LinkedDocuments kind={kind} id={id} petId={petId} /> : null;
    case 'food':
      return <FoodExtras id={id} />;
    case 'feeding':
      return <FeedingExtras id={id} petId={petId} />;
    default:
      return null;
  }
}

function TreatmentExtras({ id }: { id: string }) {
  const { t } = useTranslation();
  const { data } = useData(async (r) => ({ treatment: await r.treatments.get(id), logs: await r.treatments.logs(id) }), [id]);
  if (!data?.treatment) return null;
  const status = treatmentStatus(data.treatment, clock.today());
  const ongoing = status === 'active' || status === 'ending_soon';
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading">{t('records.treatment.tracking')}</Text>
        <StatusBadge status={status} />
      </Row>
      {ongoing ? <Button label={t('records.treatment.logDose')} icon="checkmark-done" onPress={() => mutate(t, () => repos().logTreatmentDose(id))} testID="log-dose" /> : null}
      {ongoing ? (
        <Button
          label={t('records.treatment.stop')}
          variant="secondary"
          icon="stop-circle-outline"
          onPress={() =>
            Alert.alert(t('records.treatment.stopTitle'), t('records.treatment.stopBody'), [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('records.treatment.stop'), onPress: () => mutate(t, () => repos().update('treatments', id, { stoppedAt: clock.today() })) },
            ])
          }
        />
      ) : null}
      {status === 'stopped' ? <Button label={t('records.treatment.resume')} variant="secondary" onPress={() => mutate(t, () => repos().update('treatments', id, { stoppedAt: null }))} /> : null}
      <SectionHeader title={t('records.treatment.history')} />
      {data.logs.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('records.treatment.noLogs')}
        </Text>
      ) : (
        data.logs.slice(0, 30).map((l) => <ListRow key={l.id} icon="checkmark-circle-outline" title={fmt.dateTime(l.givenAt)} />)
      )}
    </Card>
  );
}

function AppointmentExtras({ id }: { id: string }) {
  const { t } = useTranslation();
  const { data } = useData((r) => r.appointments.get(id), [id]);
  if (!data || data.status !== 'scheduled') return null;
  return (
    <Card>
      <Text variant="subheading">{t('records.appointment.close')}</Text>
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          <Button
            label={t('records.appointment.markDone')}
            icon="checkmark"
            size="md"
            onPress={async () => {
              await mutate(t, () => repos().update('appointments', id, { status: 'completed' }));
              if (data.estimatedCost)
                Alert.alert(t('records.appointment.addExpenseTitle'), t('records.appointment.addExpenseBody'), [
                  { text: t('common.no'), style: 'cancel' },
                  {
                    text: t('common.yes'),
                    onPress: () =>
                      mutate(t, () =>
                        repos().create('expenses', {
                          petId: data.petId,
                          date: clock.today(),
                          amount: data.estimatedCost ?? 0,
                          currency: data.currency ?? usePreferences.getState().currency,
                          category: data.type === 'vet' ? 'vet' : data.type === 'grooming' ? 'grooming' : data.type === 'boarding' ? 'boarding' : 'other',
                          notes: data.title ?? data.provider,
                          receiptDocumentId: null,
                        }),
                      ),
                  },
                ]);
            }}
          />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <Button label={t('records.appointment.cancel')} variant="secondary" size="md" onPress={() => mutate(t, () => repos().update('appointments', id, { status: 'cancelled' }))} />
        </Stack>
      </Row>
    </Card>
  );
}

function LinkedDocuments({ kind, id, petId }: { kind: 'health' | 'vaccination'; id: string; petId: string }) {
  const { t } = useTranslation();
  const { data } = useData((r) => r.tables.documents.list(kind === 'health' ? 'health_record_id = ?' : 'vaccination_id = ?', [id], 'created_at DESC'), [id]);
  const param = kind === 'health' ? 'healthRecordId' : 'vaccinationId';
  return (
    <Card>
      <Text variant="subheading">{t('documents.linked')}</Text>
      {(data ?? []).map((d) => (
        <ListRow key={d.id} icon="document-attach-outline" title={d.title} subtitle={t(`options.documentCategory.${d.category}`)} onPress={() => router.push(`/document/${d.id}`)} />
      ))}
      <Button label={t('documents.attach')} variant="secondary" icon="attach" size="md" onPress={() => router.push(`/document/new?petId=${petId}&${param}=${id}`)} />
    </Card>
  );
}

function FoodExtras({ id }: { id: string }) {
  const { t } = useTranslation();
  const currency = usePreferences((s) => s.currency);
  const { data } = useData(async (r) => ({ item: await r.food.get(id), purchases: await r.food.purchases(id) }), [id]);
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [use, setUse] = useState('');
  if (!data?.item) return null;
  const item = data.item;
  const level = stockLevel(item);
  const left = daysOfStockLeft(item);
  return (
    <Card>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="subheading">{t('records.food.stock')}</Text>
        <StatusBadge status={level} />
      </Row>
      <Text tone="muted">
        {t('records.food.inStock', { quantity: fmt.number(item.quantity, 2), unit: t(`options.unit.${item.unit}`) })}
        {left != null ? ` · ${t('records.food.daysLeft', { count: left })}` : ''}
      </Text>
      <Divider />
      <Text variant="bodySmall" style={{ fontWeight: '700' }}>
        {t('records.food.recordPurchase')}
      </Text>
      <Row gap={2}>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('fields.quantity')} value={qty} onChange={setQty} keyboardType="decimal-pad" maxLength={8} testID="purchase-qty" />
        </Stack>
        <Stack style={{ flex: 1 }}>
          <TextField label={`${t('fields.cost')} (${currency})`} value={cost} onChange={setCost} keyboardType="decimal-pad" maxLength={10} />
        </Stack>
      </Row>
      <Button
        label={t('records.food.addPurchase')}
        size="md"
        icon="cart-outline"
        disabled={!parseDecimal(qty)}
        onPress={async () => {
          await mutate(t, () => repos().recordPurchase({ foodId: id, date: clock.today(), quantity: parseDecimal(qty) ?? 0, cost: parseDecimal(cost), currency, petId: item.petId }));
          setQty('');
          setCost('');
        }}
        testID="add-purchase"
      />
      <Row gap={2} style={{ alignItems: 'flex-end' }}>
        <Stack style={{ flex: 1 }}>
          <TextField label={t('records.food.useQuantity')} value={use} onChange={setUse} keyboardType="decimal-pad" maxLength={8} />
        </Stack>
        <Button
          label={t('records.food.use')}
          size="md"
          variant="secondary"
          disabled={!parseDecimal(use)}
          onPress={async () => {
            await mutate(t, () => repos().consumeFood(id, parseDecimal(use) ?? 0));
            setUse('');
          }}
        />
      </Row>
      <SectionHeader title={t('records.food.purchaseHistory')} />
      {data.purchases.length === 0 ? (
        <Text variant="bodySmall" tone="muted">
          {t('records.food.noPurchases')}
        </Text>
      ) : (
        data.purchases.map((p) => (
          <ListRow
            key={p.id}
            icon="receipt-outline"
            title={`${fmt.day(p.date)} · +${fmt.number(p.quantity, 2)} ${t(`options.unit.${item.unit}`)}`}
            right={p.cost != null && p.currency ? <Badge label={fmt.money(p.cost, p.currency)} tone="neutral" /> : undefined}
          />
        ))
      )}
    </Card>
  );
}

function FeedingExtras({ id, petId }: { id: string; petId: string | null }) {
  const { t } = useTranslation();
  const { data } = useData(async (r) => (petId ? (await r.feeding.logs(petId)).filter((l) => l.scheduleId === id).slice(0, 20) : []), [id, petId]);
  if (!petId) return null;
  return (
    <Card>
      <Text variant="subheading">{t('records.feeding.history')}</Text>
      <Button label={t('records.feeding.logMeal')} icon="checkmark" size="md" onPress={() => mutate(t, () => repos().logMeal(petId, id))} testID="log-meal" />
      {(data ?? []).map((l) => (
        <ListRow key={l.id} icon="restaurant-outline" title={fmt.dateTime(l.fedAt)} />
      ))}
    </Card>
  );
}
