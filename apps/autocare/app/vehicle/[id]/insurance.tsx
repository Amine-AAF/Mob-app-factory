import { Button, Card, EmptyState, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { InfoNote, ItemRow, StatusBadge } from '@/components/ui';
import { repos } from '@/database';
import { currentPolicy, expectedPaymentDays, policyStatus } from '@/features/deadlines/deadlines';
import { sumByCurrency } from '@/features/money/money';
import { useAsync, useFormat, useToday } from '@/hooks';

export default function VehicleInsurance() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAsync(async () => {
    const policies = await repos().insurance.list(id);
    const current = currentPolicy(policies, today);
    return { policies, current, payments: current ? await repos().insurance.payments(current.id) : [] };
  }, [id, today]);

  const p = data?.current;
  const history = (data?.policies ?? []).filter((x) => x.id !== p?.id);

  return (
    <>
      <RouterStack.Screen options={{ title: t('insurance.title') }} />
      <Screen edges={[]}>
        {data && !p ? <EmptyState icon="shield-outline" title={t('insurance.empty')} /> : null}
        {p ? (
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text variant="heading">{p.insurer}</Text>
              <StatusBadge status={policyStatus(p, today)} />
            </Row>
            {p.policyNumber ? (
              <Text variant="bodySmall" tone="muted">
                {t('insurance.policyNumber')}: {p.policyNumber}
              </Text>
            ) : null}
            <Text variant="bodySmall">
              {f.day(p.startDay)} → {f.day(p.endDay)}
            </Text>
            {p.premiumMinor !== null ? (
              <Text variant="subheading">
                {f.money(p.premiumMinor, p.currency)} · {t(`paymentFrequencies.${p.paymentFrequency}`)}
              </Text>
            ) : null}
            {p.coverage ? (
              <Text variant="bodySmall" tone="muted">
                {p.coverage}
              </Text>
            ) : null}
            {p.contactName || p.contactPhone || p.contactEmail ? (
              <View style={{ gap: 4 }}>
                <Text variant="label" tone="subtle">
                  {t('insurance.contact')}
                </Text>
                {p.contactName ? <Text variant="bodySmall">{p.contactName}</Text> : null}
                {p.contactPhone ? (
                  <Text variant="bodySmall" tone="primary" onPress={() => void Linking.openURL(`tel:${p.contactPhone!.replace(/[^\d+]/g, '')}`)}>
                    {p.contactPhone}
                  </Text>
                ) : null}
                {p.contactEmail ? (
                  <Text variant="bodySmall" tone="primary" onPress={() => void Linking.openURL(`mailto:${p.contactEmail}`)}>
                    {p.contactEmail}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <Row gap={2}>
              <View style={{ flex: 1 }}>
                <Button label={t('common.edit')} icon="create-outline" variant="secondary" size="md" onPress={() => router.push({ pathname: '/insurance/edit', params: { id: p.id } })} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={t('insurance.renew')} icon="refresh" size="md" onPress={() => router.push({ pathname: '/insurance/edit', params: { renewFrom: p.id } })} />
              </View>
            </Row>
          </Card>
        ) : null}

        {p ? (
          <>
            <SectionHeader title={t('insurance.payments')} action={t('insurance.addPayment')} onAction={() => router.push({ pathname: '/expense/edit', params: { insuranceId: p.id, category: 'insurance' } })} />
            <Card>
              <InfoNote text={t('insurance.expectedPayments', { count: expectedPaymentDays(p).length })} />
              {data?.payments.length ? (
                <>
                  {data.payments.map((e) => (
                    <ItemRow key={e.id} icon="cash-outline" title={f.money(e.amountMinor, e.currency)} subtitle={f.day(e.day)} onPress={() => router.push({ pathname: '/expense/edit', params: { id: e.id } })} />
                  ))}
                  <Text variant="bodySmall" tone="muted">
                    {f.totals(sumByCurrency(data.payments.map((e) => ({ minor: e.amountMinor, currency: e.currency }))), p.currency)}
                  </Text>
                </>
              ) : (
                <Text variant="bodySmall" tone="muted">
                  {t('insurance.noPayments')}
                </Text>
              )}
            </Card>
          </>
        ) : null}

        {history.length ? (
          <>
            <SectionHeader title={t('insurance.history')} />
            <Card>
              {history.map((h) => (
                <ItemRow key={h.id} icon="shield-outline" tone="neutral" title={h.insurer} subtitle={`${f.day(h.startDay)} → ${f.day(h.endDay)}`} value={h.premiumMinor !== null ? f.money(h.premiumMinor, h.currency) : null} onPress={() => router.push({ pathname: '/insurance/edit', params: { id: h.id } })} />
              ))}
            </Card>
          </>
        ) : null}
        <Button label={t('insurance.add')} icon="add" variant={p ? 'secondary' : 'primary'} onPress={() => router.push({ pathname: '/insurance/edit', params: { vehicleId: id } })} />
      </Screen>
    </>
  );
}
