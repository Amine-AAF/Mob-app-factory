import { Button, Card, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PhotoStrip } from '@/components/media';
import { DueBadge, IconTile, ItemRow, ScreenHeader } from '@/components/ui';
import { ASSET_ICONS, DOCUMENT_ICONS, INVENTORY_ICONS, MAINTENANCE_ICONS, ROOM_ICONS } from '@/config/icons';
import { repos } from '@/database';
import { dueStatus } from '@/domain/recurrence';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';

/** A space and everything in it: equipment, tasks, documents, inventory, photos. */
export default function RoomDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const { data } = useData(async () => {
    const r = repos();
    const room = await r.homes.getRoom(id);
    if (!room) return null;
    const [assets, tasks, docs, items] = await Promise.all([
      r.assets.list(room.homeId, { roomId: id }),
      r.maintenance.list(room.homeId, { roomId: id }),
      r.documents.list(room.homeId, { roomId: id }),
      r.inventory.list(room.homeId, { roomId: id }),
    ]);
    return { room, assets, tasks, docs, items };
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
  const { room } = data;

  return (
    <Screen>
      <ScreenHeader title={room.name} subtitle={t(`roomKinds.${room.kind}`)} back right={<IconButton icon="create-outline" label={t('rooms.edit')} onPress={() => router.push({ pathname: '/rooms/edit', params: { id } })} />} />
      <Card>
        <Row gap={3}>
          <IconTile icon={ROOM_ICONS[room.kind]} size={48} />
          <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
            {room.notes ?? t('rooms.summary', { assets: data.assets.length, tasks: data.tasks.length })}
          </Text>
        </Row>
        <PhotoStrip ownerType="room" ownerId={room.id} />
      </Card>

      <SectionHeader title={t('myHome.sections.assets')} action={t('common.add')} onAction={() => router.push({ pathname: '/assets/edit', params: { roomId: id } })} />
      {data.assets.length === 0 ? <Text variant="bodySmall" tone="muted">{t('rooms.noAssets')}</Text> : null}
      <Stack gap={2}>
        {data.assets.map((a) => (
          <ItemRow key={a.id} icon={ASSET_ICONS[a.category]} title={a.name} subtitle={[a.brand, a.model].filter(Boolean).join(' ')} onPress={() => router.push(`/assets/${a.id}`)} />
        ))}
      </Stack>

      <SectionHeader title={t('maintenance.title')} action={t('common.add')} onAction={() => router.push({ pathname: '/maintenance/edit', params: { roomId: id } })} />
      <Stack gap={2}>
        {data.tasks.map((m) => (
          <ItemRow key={m.id} icon={MAINTENANCE_ICONS[m.category]} title={m.title} right={<DueBadge status={dueStatus(m.nextDue, today)} date={m.nextDue} today={today} />} onPress={() => router.push(`/maintenance/${m.id}`)} />
        ))}
      </Stack>

      {data.docs.length ? <SectionHeader title={t('documents.title')} /> : null}
      <Stack gap={2}>
        {data.docs.map((d) => (
          <ItemRow key={d.id} icon={DOCUMENT_ICONS[d.type]} title={d.title} subtitle={t(`documentTypes.${d.type}`)} onPress={() => router.push(`/documents/${d.id}`)} />
        ))}
      </Stack>

      {data.items.length ? <SectionHeader title={t('myHome.sections.inventory')} /> : null}
      <Stack gap={2}>
        {data.items.map((i) => (
          <ItemRow key={i.id} icon={INVENTORY_ICONS[i.category]} title={i.name} subtitle={`× ${i.quantity}`} onPress={() => router.push(`/inventory/${i.id}`)} />
        ))}
      </Stack>
      <Button label={t('inventory.add')} variant="ghost" icon="add" onPress={() => router.push({ pathname: '/inventory/edit', params: { roomId: id } })} />
    </Screen>
  );
}
