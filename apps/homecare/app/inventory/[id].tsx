import { Card, EmptyState, IconButton, Row, Screen } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PhotoStrip } from '@/components/media';
import { IconTile, InfoLine, ItemRow, ScreenHeader } from '@/components/ui';
import { INVENTORY_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { useData } from '@/hooks/useData';
import { fmt } from '@/i18n';

export default function InventoryDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useData(async () => {
    const r = repos();
    const item = await r.inventory.get(id);
    if (!item) return null;
    const [room, doc] = await Promise.all([item.roomId ? r.homes.getRoom(item.roomId) : null, item.documentId ? r.documents.get(item.documentId) : null]);
    return { item, room, doc };
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
  const { item } = data;
  const unit = item.estimatedValueMinor != null && item.currency ? { amountMinor: item.estimatedValueMinor, currency: item.currency } : null;

  return (
    <Screen>
      <ScreenHeader title={item.name} subtitle={t(`inventoryCategories.${item.category}`)} back right={<IconButton icon="create-outline" label={t('inventory.edit')} onPress={() => router.push({ pathname: '/inventory/edit', params: { id } })} />} />
      <Card>
        <Row gap={3}>
          <IconTile icon={INVENTORY_ICONS[item.category]} size={52} />
        </Row>
        <InfoLine icon="layers-outline" label={t('fields.quantity')} value={String(item.quantity)} />
        <InfoLine icon="cash-outline" label={t('fields.unitValue')} value={unit ? fmt.money(unit) : null} />
        <InfoLine icon="calculator-outline" label={t('inventory.totalValue')} value={unit && item.quantity > 1 ? fmt.money({ ...unit, amountMinor: unit.amountMinor * item.quantity }) : null} />
        <InfoLine icon="calendar-outline" label={t('fields.purchaseDate')} value={item.purchaseDate ? fmt.day(item.purchaseDate, 'long') : null} />
        <InfoLine icon="grid-outline" label={t('fields.room')} value={data.room?.name} />
        <InfoLine icon="reader-outline" label={t('fields.notes')} value={item.notes} />
        <PhotoStrip ownerType="inventory" ownerId={item.id} title={t('photos.title')} />
      </Card>
      {data.doc ? <ItemRow icon="document-outline" title={data.doc.title} subtitle={t('fields.document')} onPress={() => router.push(`/documents/${data.doc!.id}`)} /> : null}
    </Screen>
  );
}
