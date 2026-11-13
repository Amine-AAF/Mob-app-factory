import { Badge, Button, Card, EmptyState, IconButton, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChipSelect } from '@/components/forms';
import { PhotoStrip, PremiumLock } from '@/components/media';
import { DueBadge, ExpiryBadge, IconTile, InfoLine, ItemRow, ScreenHeader } from '@/components/ui';
import { templatesForAsset } from '@/content/maintenanceTemplates';
import { ASSET_ICONS, ASSET_STATUS_TONE, DOCUMENT_ICONS, MAINTENANCE_ICONS, REPAIR_STATUS_TONE } from '@/config/icons';
import { FREE_LIMITS } from '@/config/limits';
import { repos } from '@/database';
import { addDays } from '@/domain/dates';
import { dueStatus } from '@/domain/recurrence';
import { ASSET_STATUSES, type AssetStatus } from '@/domain/types';
import { daysLeft, expiryStatus } from '@/domain/warranty';
import { useData } from '@/hooks/useData';
import { useToday } from '@/hooks/useHome';
import { fmt } from '@/i18n';
import { mutate } from '@/services/mutations';
import { useIsPremium } from '@/store/session';

interface TimelineEntry {
  key: string;
  date: string;
  icon: 'construct-outline' | 'hammer-outline' | 'wallet-outline' | 'flag-outline' | 'swap-horizontal-outline' | 'time-outline';
  title: string;
  detail?: string;
}

export default function AssetDetail() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useToday();
  const isPremium = useIsPremium();
  const since = isPremium ? null : addDays(today, -FREE_LIMITS.historyDays);

  const { data } = useData(async () => {
    const r = repos();
    const asset = await r.assets.get(id);
    if (!asset) return null;
    const [room, tasks, history, repairs, docs, expenses, events] = await Promise.all([
      asset.roomId ? r.homes.getRoom(asset.roomId) : Promise.resolve(null),
      r.maintenance.list(asset.homeId, { assetId: id }),
      r.maintenance.history(asset.homeId, { assetId: id, since }),
      r.repairs.list(asset.homeId, { assetId: id }),
      r.documents.list(asset.homeId, { assetId: id }),
      r.expenses.list(asset.homeId, { assetId: id, from: since }),
      r.assets.events(id),
    ]);
    return { asset, room, tasks, history, repairs, docs, expenses, events };
  }, [id, since]);

  if (data === null) {
    return (
      <Screen>
        <ScreenHeader title="" back />
        <EmptyState icon="alert-circle-outline" title={t('common.notFound')} />
      </Screen>
    );
  }
  if (!data) return <Screen>{null}</Screen>;
  const { asset } = data;
  const left = daysLeft(asset.warrantyEnd, today);

  const setStatus = (s: AssetStatus | null) => {
    if (!s || s === asset.status) return;
    void mutate(() => repos().assets.update(asset.id, { status: s }));
    if (s === 'in_repair' && !data.repairs.some((r) => r.status !== 'completed' && r.status !== 'cancelled')) {
      Alert.alert(t('assets.repairPromptTitle'), t('assets.repairPrompt'), [
        { text: t('common.later'), style: 'cancel' },
        { text: t('repairs.add'), onPress: () => router.push({ pathname: '/repairs/edit', params: { assetId: asset.id } }) },
      ]);
    }
  };

  const timeline: TimelineEntry[] = [
    ...data.history.map((h): TimelineEntry => ({ key: `h${h.id}`, date: h.doneOn, icon: h.action === 'completed' ? 'construct-outline' : 'time-outline', title: h.taskTitle ?? '', detail: t(`history.actions.${h.action}`) })),
    ...data.repairs.filter((r) => !since || r.reportedOn >= since).map((r): TimelineEntry => ({ key: `r${r.id}`, date: r.completedOn ?? r.scheduledOn ?? r.reportedOn, icon: 'hammer-outline', title: r.title, detail: t(`repairStatus.${r.status}`) })),
    ...data.expenses.map((e): TimelineEntry => ({ key: `e${e.id}`, date: e.spentOn, icon: 'wallet-outline', title: e.title ?? t(`expenseCategories.${e.category}`), detail: fmt.money(e) })),
    ...data.events
      .filter((e) => !since || e.createdAt.slice(0, 10) >= since)
      .map((e): TimelineEntry => {
        const [from, to] = (e.detail ?? '').split('>');
        return { key: `ev${e.id}`, date: e.createdAt.slice(0, 10), icon: e.kind === 'created' ? 'flag-outline' : 'swap-horizontal-outline', title: e.kind === 'created' ? t('assets.events.created') : t('assets.events.status', { from: from ? t(`assetStatus.${from}`) : '', to: to ? t(`assetStatus.${to}`) : '' }) };
      }),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const suggestions = templatesForAsset(asset.category).filter((tpl) => !data.tasks.some((task) => task.templateId === tpl.id));

  return (
    <Screen testID="asset-detail">
      <ScreenHeader title={asset.name} subtitle={[t(`assetCategories.${asset.category}`), data.room?.name].filter(Boolean).join(' · ')} back right={<IconButton icon="create-outline" label={t('assets.edit')} onPress={() => router.push({ pathname: '/assets/edit', params: { id } })} />} />

      <Card>
        <Row gap={3}>
          <IconTile icon={ASSET_ICONS[asset.category]} size={52} />
          <Stack gap={1} style={{ flex: 1 }}>
            <Badge label={t(`assetStatus.${asset.status}`)} tone={ASSET_STATUS_TONE[asset.status]} />
            <ExpiryBadge status={expiryStatus(asset.warrantyEnd, today)} date={asset.warrantyEnd} today={today} />
          </Stack>
        </Row>
        {left !== null ? (
          <Text variant="bodySmall" tone={left < 0 ? 'danger' : left <= 60 ? 'warning' : 'muted'}>
            {left < 0 ? t('assets.warrantyExpiredOn', { date: fmt.day(asset.warrantyEnd, 'long') }) : t('assets.warrantyLeft', { count: left, date: fmt.day(asset.warrantyEnd, 'long') })}
          </Text>
        ) : null}
        <InfoLine icon="pricetag-outline" label={t('fields.brand')} value={[asset.brand, asset.model].filter(Boolean).join(' ') || null} />
        <InfoLine icon="barcode-outline" label={t('fields.serialNumber')} value={asset.serialNumber} />
        <InfoLine icon="calendar-outline" label={t('fields.purchaseDate')} value={asset.purchaseDate ? fmt.day(asset.purchaseDate, 'long') : null} />
        <InfoLine icon="cash-outline" label={t('fields.purchasePrice')} value={asset.purchasePriceMinor != null && asset.currency ? fmt.money({ amountMinor: asset.purchasePriceMinor, currency: asset.currency }) : null} />
        <InfoLine icon="storefront-outline" label={t('fields.vendor')} value={asset.vendor} />
        <InfoLine icon="reader-outline" label={t('fields.notes')} value={asset.notes} />
        <PhotoStrip ownerType="asset" ownerId={asset.id} title={t('photos.title')} />
      </Card>

      <ChipSelect label={t('fields.status')} options={ASSET_STATUSES} value={asset.status} onChange={setStatus} renderLabel={(v) => t(`assetStatus.${v}`)} />

      <SectionHeader title={t('maintenance.title')} action={t('common.add')} onAction={() => router.push({ pathname: '/maintenance/edit', params: { assetId: id } })} />
      <Stack gap={2}>
        {data.tasks.map((m) => (
          <ItemRow key={m.id} icon={MAINTENANCE_ICONS[m.category]} title={m.title} subtitle={t(`frequencies.${m.frequency}`)} right={<DueBadge status={dueStatus(m.nextDue, today)} date={m.nextDue} today={today} />} onPress={() => router.push(`/maintenance/${m.id}`)} />
        ))}
        {suggestions.slice(0, 3).map((tpl) => (
          <ItemRow
            key={tpl.id}
            icon="sparkles-outline"
            title={t(`templates.${tpl.id}.title`)}
            subtitle={`${t('assets.suggested')} · ${t(`frequencies.${tpl.frequency}`)}`}
            onPress={() => router.push({ pathname: '/maintenance/edit', params: { templateId: tpl.id, assetId: id } })}
          />
        ))}
      </Stack>

      <SectionHeader title={t('repairs.title')} action={t('common.add')} onAction={() => router.push({ pathname: '/repairs/edit', params: { assetId: id } })} />
      <Stack gap={2}>
        {data.repairs.map((r) => (
          <ItemRow key={r.id} icon="hammer-outline" title={r.title} subtitle={fmt.day(r.scheduledOn ?? r.reportedOn)} right={<Badge label={t(`repairStatus.${r.status}`)} tone={REPAIR_STATUS_TONE[r.status]} />} onPress={() => router.push(`/repairs/${r.id}`)} />
        ))}
      </Stack>

      <SectionHeader title={t('documents.title')} action={t('common.add')} onAction={() => router.push({ pathname: '/documents/edit', params: { assetId: id } })} />
      <Stack gap={2}>
        {data.docs.map((d) => (
          <ItemRow key={d.id} icon={DOCUMENT_ICONS[d.type]} title={d.title} subtitle={t(`documentTypes.${d.type}`)} onPress={() => router.push(`/documents/${d.id}`)} />
        ))}
      </Stack>

      <SectionHeader title={t('assets.history')} />
      {!isPremium ? <PremiumLock feature="full_history" message={t('limits.history', { days: FREE_LIMITS.historyDays })} /> : null}
      {timeline.length === 0 ? <Text variant="bodySmall" tone="muted">{t('assets.noHistory')}</Text> : null}
      <Stack gap={2}>
        {timeline.map((e) => (
          <ItemRow key={e.key} icon={e.icon} title={e.title} subtitle={[fmt.day(e.date), e.detail].filter(Boolean).join(' · ')} />
        ))}
      </Stack>
      <Button label={t('expenses.add')} variant="ghost" icon="wallet-outline" onPress={() => router.push({ pathname: '/expenses/edit', params: { assetId: id } })} />
    </Screen>
  );
}
