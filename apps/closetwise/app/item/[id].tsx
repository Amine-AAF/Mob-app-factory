import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import { confirmDelete } from '@/components/forms';
import { ItemPhoto } from '@/components/ItemPhoto';
import { itemMap, OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { CARE_STATUSES, type CareStatus } from '@/domain/catalog';
import { costPerWear, usageLevel } from '@/domain/insights';
import type { Outfit, WardrobeItem } from '@/domain/types';
import { ArchivedBadge, careColor } from '@/features/wardrobe/components';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { deletePhotoFiles } from '@/services/photos';
import { Badge, Button, Card, ChoiceChips, ColorDot, Divider, EmptyState, FadeIn, IconButton, ListRow, Loading, PressableScale, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@/ui';

interface Detail {
  item: WardrobeItem | null;
  outfits: Outfit[];
  outfitItems: Map<string, WardrobeItem>;
  hasCare: boolean;
}

async function loadDetail(id: string): Promise<Detail> {
  const r = repos();
  const item = await r.wardrobe.get(id);
  if (!item) return { item: null, outfits: [], outfitItems: new Map(), hasCare: false };
  const outfitIds = await r.outfits.containingItem(id);
  const outfits = (await Promise.all(outfitIds.map((o) => r.outfits.get(o)))).filter((o): o is Outfit => !!o);
  const itemIds = [...new Set(outfits.flatMap((o) => o.items.map((i) => i.itemId)))];
  const outfitItems = itemMap(await r.wardrobe.getMany(itemIds));
  const hasCare = !!(await r.care.instructions(id));
  return { item, outfits, outfitItems, hasCare };
}

function InfoRow({ label, value, children }: { label: string; value?: string | null; children?: ReactNode }) {
  if (!value && !children) return null;
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 }} gap={4}>
      <Text variant="bodySmall" tone="subtle" style={{ minWidth: 100 }}>
        {label}
      </Text>
      {children ?? (
        <Text variant="body" style={{ flex: 1, textAlign: 'right' }}>
          {value}
        </Text>
      )}
    </Row>
  );
}

export default function ItemDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = String(rawId ?? '');
  const { data, loading } = useAsync(() => loadDetail(id), [id]);
  const [busy, setBusy] = useState(false);
  const today = clock.today();

  const run = async (fn: () => Promise<unknown>, context: string) => {
    setBusy(true);
    try {
      await fn();
      afterWrite();
    } catch (e) {
      recordError(e, context);
      Alert.alert(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('item.detailTitle') }} />
        <Loading />
      </Screen>
    );
  }
  const item = data.item;
  if (!item) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('item.detailTitle') }} />
        {loading ? (
          <Loading />
        ) : (
          <EmptyState
            icon="help-circle-outline"
            title={t('item.notFoundTitle')}
            message={t('item.notFoundMessage')}
            action={<Button variant="secondary" label={t('item.backToWardrobe')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/wardrobe'))} />}
          />
        )}
      </Screen>
    );
  }

  const wornToday = item.lastWornOn === today;
  const cpw = costPerWear(item.purchasePrice, item.wearCount);
  const usage = usageLevel(item, today);
  const colors = [item.primaryColor, ...item.secondaryColors].filter((c): c is string => !!c);
  const size = [item.size, item.sizeSystem ? t(`catalog.sizeSystem.${item.sizeSystem}`) : null].filter(Boolean).join(' · ');

  const onDelete = () =>
    confirmDelete(
      t,
      () =>
        void run(async () => {
          const files = await repos().wardrobe.remove(item.id);
          if (files) deletePhotoFiles(files.photoPath, files.thumbPath);
          await repos().outfits.removeEmpty();
          router.back();
        }, 'delete_item'),
      t('item.deleteTitle'),
      t('item.deleteMessage'),
    );

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: t('item.detailTitle'),
          headerRight: () => <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/item/edit', params: { id: item.id } })} testID="item-edit" />,
        }}
      />
      <FadeIn>
        <View style={{ alignSelf: 'center', width: '78%', maxWidth: 360 }}>
          <ItemPhoto
            photoPath={item.photoPath}
            thumbPath={item.thumbPath}
            categoryKey={labels.categoryKey(item.categoryId)}
            color={item.primaryColor}
            size="full"
            accessibilityLabel={item.name}
          />
        </View>
      </FadeIn>

      <Stack gap={1}>
        <Text variant="label" tone="accent">
          {[labels.category(item.categoryId), item.subcategory].filter(Boolean).join(' · ')}
        </Text>
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Text variant="display" style={{ flex: 1 }} accessibilityRole="header">
            {item.name}
          </Text>
          <IconButton
            icon={item.favorite ? 'heart' : 'heart-outline'}
            tone={item.favorite ? 'danger' : 'default'}
            label={item.favorite ? t('item.favoriteRemove') : t('item.favoriteAdd')}
            onPress={() => void run(() => repos().wardrobe.setFavorite(item.id, !item.favorite), 'favorite_item')}
            testID="item-favorite"
          />
        </Row>
        {item.archived ? <ArchivedBadge /> : null}
      </Stack>

      <Row gap={2}>
        {wornToday ? (
          <>
            <Badge tone="success" icon="checkmark-circle" label={t('item.wornTodayDone')} />
            <Button small variant="ghost" label={t('item.undoWorn')} onPress={() => void run(() => repos().usage.removeWear(item.id, today), 'unlog_wear')} disabled={busy} />
          </>
        ) : (
          <Button small icon="sunny-outline" label={t('item.wornToday')} onPress={() => void run(() => repos().usage.logWear([item.id], today), 'log_wear')} disabled={busy || item.archived} testID="item-worn-today" />
        )}
      </Row>

      <Card>
        <SectionHeader title={t('item.stats')} />
        <Row gap={2} wrap>
          <Stack gap={0.5} style={{ flex: 1, minWidth: 90 }}>
            <Text variant="number">{fmt.number(item.wearCount)}</Text>
            <Text variant="caption" tone="subtle">
              {t('item.wearCount')}
            </Text>
          </Stack>
          <Stack gap={0.5} style={{ flex: 1, minWidth: 90 }}>
            <Text variant="heading" style={{ marginTop: 6 }}>
              {item.lastWornOn ? fmt.day(item.lastWornOn) : t('item.never')}
            </Text>
            <Text variant="caption" tone="subtle">
              {t('item.lastWorn')}
            </Text>
          </Stack>
        </Row>
        <Divider />
        <InfoRow label={t('item.usageLevel')} value={t(`catalog.usage.${usage}`)} />
        <InfoRow label={t('item.costPerWear')} value={cpw != null && item.currency ? fmt.money(cpw, item.currency) : null}>
          {cpw == null || !item.currency ? (
            <Text variant="bodySmall" tone="muted" style={{ flex: 1, textAlign: 'right' }}>
              {item.purchasePrice == null ? t('item.cpwNoPrice') : t('item.cpwUnavailable')}
            </Text>
          ) : undefined}
        </InfoRow>
      </Card>

      <Stack gap={2}>
        <SectionHeader title={t('item.careStatus')} />
        <ChoiceChips<CareStatus>
          options={CARE_STATUSES.map((s) => ({ value: s, label: t(`catalog.care.${s}`), color: careColor(theme, s) }))}
          value={item.careStatus}
          onChange={(s) => s && s !== item.careStatus && void run(() => repos().wardrobe.setCareStatus([item.id], s), 'care_status')}
        />
        <ListRow
          icon="water-outline"
          title={t('item.careInstructions')}
          subtitle={data.hasCare ? t('item.careSaved') : t('item.careNone')}
          onPress={() => router.push({ pathname: '/item/care', params: { id: item.id } })}
          testID="item-care"
        />
      </Stack>

      <Card>
        <SectionHeader title={t('item.details')} />
        <InfoRow label={t('item.colors')}>
          {colors.length ? (
            <Row gap={2} wrap style={{ flex: 1, justifyContent: 'flex-end' }}>
              {colors.map((c) => (
                <Row key={c} gap={1}>
                  <ColorDot hex={labels.colorHex(c)} />
                  <Text variant="bodySmall">{labels.color(c)}</Text>
                </Row>
              ))}
            </Row>
          ) : undefined}
        </InfoRow>
        <InfoRow label={t('item.brand')} value={item.brandName} />
        <InfoRow label={t('item.size')} value={size || null} />
        <InfoRow label={t('item.seasons')} value={labels.seasons(item.seasons)} />
        <InfoRow label={t('item.style')} value={labels.style(item.styleId) || null} />
        <InfoRow label={t('item.occasions')} value={item.occasionIds.map((o) => labels.occasion(o)).filter(Boolean).join(', ') || null} />
        <InfoRow label={t('item.condition')} value={item.condition ? t(`catalog.condition.${item.condition}`) : null} />
        <InfoRow label={t('item.purchaseDate')} value={item.purchaseDate ? fmt.day(item.purchaseDate) : null} />
        <InfoRow label={t('item.purchasePrice')} value={item.purchasePrice != null && item.currency ? fmt.money(item.purchasePrice, item.currency) : null} />
        {item.notes ? (
          <Stack gap={1} style={{ paddingTop: 6 }}>
            <Text variant="bodySmall" tone="subtle">
              {t('item.notes')}
            </Text>
            <Text>{item.notes}</Text>
          </Stack>
        ) : null}
      </Card>

      <Stack gap={2}>
        <SectionHeader title={t('item.outfits')} />
        {data.outfits.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(3) }}>
            {data.outfits.map((o) => (
              <PressableScale key={o.id} onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={o.name} style={{ width: 150, gap: 6 }}>
                <OutfitCollage refs={o.items} items={data.outfitItems} height={190} />
                <Text variant="bodySmall" numberOfLines={1}>
                  {o.name}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>
        ) : (
          <Text tone="muted">{t('item.noOutfits')}</Text>
        )}
        <Button variant="secondary" icon="layers-outline" label={t('item.createOutfit')} onPress={() => router.push({ pathname: '/outfit/builder', params: { itemId: item.id } })} disabled={item.archived} testID="item-create-outfit" />
      </Stack>

      <Stack gap={2}>
        <Button variant="secondary" icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/item/edit', params: { id: item.id } })} />
        <Button
          variant="secondary"
          icon={item.archived ? 'arrow-undo-outline' : 'archive-outline'}
          label={item.archived ? t('item.unarchive') : t('item.archive')}
          onPress={() => void run(() => repos().wardrobe.setArchived(item.id, !item.archived), 'archive_item')}
          disabled={busy}
          testID="item-archive"
        />
        {!item.archived ? (
          <Text variant="caption" tone="subtle" center>
            {t('item.archiveHint')}
          </Text>
        ) : null}
        <Button variant="danger" icon="trash-outline" label={t('common.delete')} onPress={onDelete} disabled={busy} testID="item-delete" />
      </Stack>
    </Screen>
  );
}
