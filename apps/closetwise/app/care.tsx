import { Stack as RouterStack, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList } from 'react-native';

import { repos } from '@/database';
import { CARE_STATUSES, type CareStatus } from '@/domain/catalog';
import type { WardrobeItem } from '@/domain/types';
import { CareDot, ItemGridCard } from '@/features/wardrobe/components';
import { groupByCareStatus, toggleId } from '@/features/wardrobe/logic';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { Button, Card, EmptyState, Icon, ListRow, Loading, Row, Screen, Sheet, Stack, Text, useTheme } from '@/ui';

const TILE = 96;

export default function CareBoardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: items } = useAsync(() => repos().wardrobe.list(), []);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [moveOpen, setMoveOpen] = useState(false);

  const groups = useMemo(() => groupByCareStatus(items ?? [], CARE_STATUSES), [items]);
  const inLaundry = groups.in_laundry;

  const move = async (ids: string[], status: CareStatus) => {
    try {
      await repos().wardrobe.setCareStatus(ids, status);
      afterWrite();
      setSelected([]);
      setSelecting(false);
    } catch (e) {
      recordError(e, 'care_bulk');
      Alert.alert(t('common.error'));
    }
  };

  const laundryDone = () =>
    Alert.alert(t('care.laundryDoneTitle'), t('care.laundryDoneMessage', { count: inLaundry.length }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('catalog.care.to_iron'), onPress: () => void move(inLaundry.map((i) => i.id), 'to_iron') },
      { text: t('catalog.care.clean'), onPress: () => void move(inLaundry.map((i) => i.id), 'clean') },
    ]);

  const onTile = (i: WardrobeItem) => {
    if (selecting) setSelected((s) => toggleId(s, i.id));
    else router.push({ pathname: '/item/[id]', params: { id: i.id } });
  };

  const headerRight = () =>
    items?.length ? (
      <Button
        small
        variant="ghost"
        label={selecting ? t('common.cancel') : t('care.select')}
        onPress={() => {
          setSelecting((s) => !s);
          setSelected([]);
        }}
        testID="care-select"
      />
    ) : null;

  return (
    <Screen
      edges={[]}
      footer={
        selecting ? (
          <Row gap={3}>
            <Text style={{ flex: 1 }}>{t('care.selected', { count: selected.length })}</Text>
            <Button small label={t('care.moveTo')} icon="swap-horizontal-outline" onPress={() => setMoveOpen(true)} disabled={selected.length === 0} testID="care-move" />
          </Row>
        ) : undefined
      }
    >
      <RouterStack.Screen options={{ title: t('care.boardTitle'), headerRight }} />
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState icon="water-outline" title={t('care.emptyTitle')} message={t('care.emptyMessage')} action={<Button label={t('wardrobe.addItem')} onPress={() => router.push('/item/edit')} />} />
      ) : (
        <>
          <Card tone="alt">
            <Row gap={2} style={{ alignItems: 'flex-start' }}>
              <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
              <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
                {t('care.boardIntro')}
              </Text>
            </Row>
          </Card>
          {inLaundry.length > 0 && !selecting ? (
            <Button variant="accent" icon="checkmark-done-outline" label={t('care.laundryDone')} onPress={laundryDone} testID="care-laundry-done" />
          ) : null}
          {CARE_STATUSES.map((status) => {
            const list = groups[status];
            return (
              <Stack key={status} gap={2}>
                <Row gap={2}>
                  <CareDot status={status} size={12} />
                  <Text variant="heading" style={{ flex: 1 }} accessibilityRole="header">
                    {t(`catalog.care.${status}`)}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {t('common.items', { count: list.length })}
                  </Text>
                </Row>
                {list.length ? (
                  <FlatList
                    horizontal
                    data={list}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <ItemGridCard item={item} width={TILE} onPress={onTile} selected={selecting ? selected.includes(item.id) : undefined} />}
                    contentContainerStyle={{ gap: theme.spacing(2.5) }}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    windowSize={5}
                    removeClippedSubviews
                    extraData={selected}
                  />
                ) : (
                  <Text variant="bodySmall" tone="subtle">
                    {t('care.sectionEmpty')}
                  </Text>
                )}
              </Stack>
            );
          })}
        </>
      )}
      <Sheet visible={moveOpen} onClose={() => setMoveOpen(false)} title={t('care.moveTitle')}>
        <Stack gap={0}>
          {CARE_STATUSES.map((s) => (
            <ListRow
              key={s}
              title={t(`catalog.care.${s}`)}
              right={<CareDot status={s} size={14} />}
              onPress={() => {
                setMoveOpen(false);
                void move(selected, s);
              }}
            />
          ))}
        </Stack>
      </Sheet>
    </Screen>
  );
}
