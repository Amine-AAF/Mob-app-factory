import { Button, Card, EmptyState, IconButton, ListRow, Row, Screen, SectionHeader, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/forms';
import { limitAlert, ScreenTitle, StatusBadge } from '@/components/ui';
import { canAddVendor } from '@/config/limits';
import { vendorTotals } from '@/domain/gifts';
import { totalsToList } from '@/domain/money';
import { VENDOR_STATUSES, type VendorStatus } from '@/domain/types';
import { exportReport } from '@/features/exporter';
import { useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

export default function Vendors() {
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [status, setStatus] = useState<VendorStatus | 'all'>('all');
  if (!snap) return null;
  const totals = vendorTotals(snap.vendors);
  const committed = totalsToList(totals.committed, snap.event.currency);
  const list = snap.vendors.filter((v) => status === 'all' || v.status === status);

  const add = () => {
    const check = canAddVendor(isPremium, snap.vendors.length);
    if (!check.allowed) return limitAlert(t, check.feature, check.limit, 'vendors_limit');
    router.push({ pathname: '/event/[id]/vendor', params: { id } });
  };

  return (
    <Screen edges={[]} footer={<Button label={t('vendors.add')} icon="add" onPress={add} testID="vendor-add" />}>
      <ScreenTitle
        title={t('modules.vendors')}
        right={
          <IconButton
            icon="share-outline"
            label={t('reports.export')}
            onPress={() =>
              Alert.alert(t('reports.export'), undefined, [
                { text: 'PDF', onPress: () => void exportReport({ t, snap, kind: 'vendors', format: 'pdf', isPremium }) },
                { text: 'CSV', onPress: () => void exportReport({ t, snap, kind: 'vendors', format: 'csv', isPremium }) },
                { text: t('common.cancel'), style: 'cancel' },
              ])
            }
          />
        }
      />
      <Card tone="alt">
        <Text variant="subheading">{t('vendors.committed')}</Text>
        <Text>{committed.length ? committed.map((x) => fmt.money(x.amountMinor, x.currency)).join(' + ') : '—'}</Text>
        <Text variant="caption" tone="muted">
          {VENDOR_STATUSES.filter((s) => totals.byStatus[s] > 0)
            .map((s) => `${t(`vendorStatus.${s}`)}: ${totals.byStatus[s]}`)
            .join(' · ') || t('vendors.none')}
        </Text>
      </Card>
      <ChoiceChips value={status} onChange={setStatus} options={[{ value: 'all' as const, label: t('common.all') }, ...VENDOR_STATUSES.map((s) => ({ value: s, label: t(`vendorStatus.${s}`) }))]} />
      {list.length === 0 ? (
        <EmptyState icon="storefront-outline" title={t('vendors.emptyTitle')} message={t('vendors.emptyBody')} />
      ) : (
        <>
          <SectionHeader title={`${t('modules.vendors')} (${list.length})`} />
          <Card>
            {list.map((v) => (
              <ListRow
                key={v.id}
                title={v.name}
                subtitle={[t(`vendorCategory.${v.category}`), v.amountMinor ? fmt.money(v.amountMinor, v.currency) : null, v.meetingAt ? t('vendors.meeting', { date: fmt.instant(v.meetingAt) }) : null].filter(Boolean).join(' · ')}
                right={<StatusBadge kind="vendor" status={v.status} />}
                onPress={() => router.push({ pathname: '/event/[id]/vendor', params: { id, vendorId: v.id } })}
              />
            ))}
          </Card>
        </>
      )}
      {!isPremium ? (
        <Row style={{ justifyContent: 'center' }}>
          <Text variant="caption" tone="subtle">
            {t('vendors.freeLimit', { limit: 3 })}
          </Text>
        </Row>
      ) : null}
    </Screen>
  );
}
