import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { confirmDelete } from '@/components/forms';
import { ItemPhoto } from '@/components/ItemPhoto';
import { itemMap, OutfitCollage } from '@/components/OutfitCollage';
import { repos } from '@/database';
import { CARE_STATUSES } from '@/domain/catalog';
import { ensureCanAddOutfit } from '@/features/outfits/limits';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { useIsPremium } from '@/store/session';
import { Badge, Button, Card, Divider, EmptyState, FadeIn, IconButton, ListRow, Loading, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@/ui';

export default function OutfitDetailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const { data, loading } = useAsync(async () => {
    const outfit = await repos().outfits.get(id);
    const items = outfit ? await repos().wardrobe.getMany(outfit.items.map((r) => r.itemId)) : [];
    return { outfit, items };
  }, [id]);
  const map = useMemo(() => itemMap(data?.items ?? []), [data?.items]);

  if (!data) return <Screen edges={[]}>{loading ? <Loading /> : null}</Screen>;
  const outfit = data.outfit;
  if (!outfit) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('outfits.detail.title') }} />
        <EmptyState icon="alert-circle-outline" title={t('outfits.notFound.title')} message={t('outfits.notFound.message')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const today = clock.today();
  const wornToday = outfit.lastWornOn === today;
  const visibleRefs = outfit.items.filter((r) => map.has(r.itemId));
  const meta = [labels.style(outfit.styleId), labels.occasion(outfit.occasionId)].filter(Boolean);

  const run = async (task: () => Promise<void>, context: string) => {
    setBusy(true);
    try {
      await task();
    } catch (e) {
      recordError(e, context);
      Alert.alert(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = () => run(async () => (await repos().outfits.setFavorite(outfit.id, !outfit.favorite), afterWrite()), 'outfit_favorite');
  const toggleWorn = () =>
    run(async () => {
      if (wornToday) await repos().usage.removeOutfitWear(outfit.id, today);
      else await repos().usage.logOutfitWear(outfit.id, today);
      afterWrite();
    }, 'outfit_wear');
  const duplicate = () =>
    run(async () => {
      const count = await repos().outfits.count();
      if (!ensureCanAddOutfit(t, count, isPremium)) return;
      const copy = await repos().outfits.duplicate(outfit.id, t('outfits.detail.copyName', { name: outfit.name }));
      afterWrite();
      if (copy) router.push({ pathname: '/outfit/[id]', params: { id: copy } });
    }, 'outfit_duplicate');
  const remove = () =>
    confirmDelete(
      t,
      () =>
        run(async () => {
          await repos().outfits.remove(outfit.id);
          afterWrite({ notifications: true });
          router.back();
        }, 'outfit_delete'),
      t('outfits.detail.deleteTitle'),
      t('outfits.detail.deleteMessage'),
    );

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: t('outfits.detail.title'),
          headerRight: () => (
            <Row gap={0}>
              <IconButton icon={outfit.favorite ? 'heart' : 'heart-outline'} tone={outfit.favorite ? 'accent' : 'default'} label={outfit.favorite ? t('outfits.removeFavorite') : t('outfits.addFavorite')} onPress={toggleFavorite} />
              <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/outfit/builder', params: { id: outfit.id } })} />
            </Row>
          ),
        }}
      />
      <FadeIn>
        <OutfitCollage refs={outfit.items} items={map} height={380} />
      </FadeIn>

      <Stack gap={1.5}>
        <Text variant="display">{outfit.name}</Text>
        <Row gap={1.5} wrap>
          {meta.map((m) => (
            <Badge key={m} label={m} />
          ))}
          <Badge label={labels.seasons(outfit.seasons)} icon="leaf-outline" />
          {outfit.source === 'suggestion' ? <Badge label={t('outfits.detail.fromIdea')} icon="bulb-outline" tone="accent" /> : null}
        </Row>
      </Stack>

      <Row gap={2} wrap>
        <Button small variant={wornToday ? 'secondary' : 'primary'} icon={wornToday ? 'arrow-undo-outline' : 'checkmark-circle-outline'} label={wornToday ? t('outfits.detail.undoWearToday') : t('outfits.detail.wearToday')} onPress={toggleWorn} disabled={busy || visibleRefs.length === 0} />
        <Button small variant="secondary" icon="calendar-outline" label={t('outfits.detail.plan')} onPress={() => router.push({ pathname: '/plan/[date]', params: { date: today, outfitId: outfit.id } })} />
        <Button small variant="secondary" icon="copy-outline" label={t('outfits.detail.duplicate')} onPress={duplicate} disabled={busy} />
      </Row>

      <Card tone="alt">
        <Row style={{ justifyContent: 'space-between' }}>
          <Text tone="muted">{t('outfits.detail.wears')}</Text>
          <Text variant="heading">{outfit.wearCount > 0 ? t('common.wears', { count: outfit.wearCount }) : t('outfits.neverWorn')}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text tone="muted">{t('outfits.detail.lastWorn')}</Text>
          <Text>{outfit.lastWornOn ? fmt.day(outfit.lastWornOn) : t('common.notAvailable')}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text tone="muted">{t('outfits.detail.created')}</Text>
          <Text>{fmt.day(outfit.createdAt.slice(0, 10))}</Text>
        </Row>
      </Card>

      <SectionHeader title={t('common.items', { count: visibleRefs.length })} />
      {visibleRefs.length === 0 ? <Text tone="muted">{t('outfits.detail.noItemsLeft')}</Text> : null}
      <View>
        {visibleRefs.map((r, i) => {
          const item = map.get(r.itemId)!;
          const care = item.careStatus !== 'clean' && item.careStatus !== 'ready' && CARE_STATUSES.includes(item.careStatus) ? t(`catalog.care.${item.careStatus}`) : null;
          return (
            <View key={r.itemId}>
              {i > 0 ? <Divider /> : null}
              <Row gap={3}>
                <View style={{ width: 52 }}>
                  <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <ListRow
                    title={item.name}
                    subtitle={[t(`catalog.slot.${r.slot}`), item.archived ? t('outfits.detail.archived') : null, care].filter(Boolean).join(' · ')}
                    onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
                  />
                </View>
              </Row>
            </View>
          );
        })}
      </View>

      {outfit.notes ? (
        <Stack gap={1.5}>
          <SectionHeader title={t('outfits.builder.notes')} />
          <Text>{outfit.notes}</Text>
        </Stack>
      ) : null}

      <Divider />
      <Button variant="danger" icon="trash-outline" label={t('outfits.detail.delete')} onPress={remove} disabled={busy} />
      <View style={{ height: theme.spacing(2) }} />
    </Screen>
  );
}
