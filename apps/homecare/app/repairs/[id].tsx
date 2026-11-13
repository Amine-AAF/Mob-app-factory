import { Badge, Card, EmptyState, IconButton, Screen, SectionHeader } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChipSelect } from '@/components/forms';
import { PhotoStrip } from '@/components/media';
import { InfoLine, ItemRow, ScreenHeader } from '@/components/ui';
import { REPAIR_STATUS_TONE } from '@/config/icons';
import { repos } from '@/database';
import { REPAIR_STATUSES, type RepairStatus } from '@/domain/types';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';

export default function RepairDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data } = useData(async () => {
    const r = repos();
    const repair = await r.repairs.get(id);
    if (!repair) return null;
    const [asset, doc] = await Promise.all([repair.assetId ? r.assets.get(repair.assetId) : null, repair.documentId ? r.documents.get(repair.documentId) : null]);
    return { repair, asset, doc };
  }, [id]);

  if (data === null) {
    return (
      <Screen>
        <ScreenHeader title="" back />
        <EmptyState icon="alert-circle-outline" title={t('common.notFound')} />
      </Screen>
    );
  }
  if (!data) return <Screen>{null}</Screen>;
  const { repair } = data;

  const setStatus = (s: RepairStatus | null) => {
    if (!s || s === repair.status) return;
    void mutate(async () => {
      await repos().repairs.setStatus(id, s, today);
      if (s === 'completed' && data.asset?.status === 'in_repair') await repos().assets.update(data.asset.id, { status: 'active' });
    });
  };

  return (
    <Screen>
      <ScreenHeader title={repair.title} subtitle={data.asset?.name} back right={<IconButton icon="create-outline" label={t('repairs.edit')} onPress={() => router.push({ pathname: '/repairs/edit', params: { id } })} />} />
      <Badge label={t(`repairStatus.${repair.status}`)} tone={REPAIR_STATUS_TONE[repair.status]} />
      <ChipSelect options={REPAIR_STATUSES} value={repair.status} onChange={setStatus} renderLabel={(v) => t(`repairStatus.${v}`)} />
      <Card>
        <InfoLine icon="alert-circle-outline" label={t('fields.problem')} value={repair.problem} />
        <InfoLine icon="flag-outline" label={t('fields.reportedOn')} value={fmt.day(repair.reportedOn, 'long')} />
        <InfoLine icon="calendar-outline" label={t('fields.scheduledOn')} value={repair.scheduledOn ? fmt.day(repair.scheduledOn, 'long') : null} />
        <InfoLine icon="checkmark-done-outline" label={t('fields.completedOn')} value={repair.completedOn ? fmt.day(repair.completedOn, 'long') : null} />
        <InfoLine icon="person-outline" label={t('fields.provider')} value={[repair.provider, repair.providerContact].filter(Boolean).join(' · ') || null} />
        <InfoLine icon="cash-outline" label={t('fields.cost')} value={repair.costMinor != null && repair.currency ? fmt.money({ amountMinor: repair.costMinor, currency: repair.currency }) : null} />
        <InfoLine icon="shield-checkmark-outline" label={t('fields.underWarranty')} value={repair.underWarranty ? t('common.yes') : t('common.no')} />
        <InfoLine icon="ribbon-outline" label={t('fields.outcome')} value={repair.outcome} />
        <InfoLine icon="reader-outline" label={t('fields.notes')} value={repair.notes} />
      </Card>
      {data.asset ? <ItemRow icon="cube-outline" title={data.asset.name} subtitle={t('repairs.assetHistory')} onPress={() => router.push(`/assets/${data.asset!.id}`)} /> : null}
      {data.doc ? <ItemRow icon="receipt-outline" title={data.doc.title} subtitle={t('fields.invoice')} onPress={() => router.push(`/documents/${data.doc!.id}`)} /> : null}
      <SectionHeader title={t('repairs.photos')} />
      <PhotoStrip ownerType="repair" ownerId={repair.id} kind="before" title={t('repairs.before')} />
      <PhotoStrip ownerType="repair" ownerId={repair.id} kind="after" title={t('repairs.after')} />
    </Screen>
  );
}
