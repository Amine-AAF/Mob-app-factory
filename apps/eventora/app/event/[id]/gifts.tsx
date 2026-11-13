import { Button, Card, EmptyState, Icon, IconButton, Row, Screen, Text, useTheme } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { ChoiceChips } from '@/components/forms';
import { Kpi, KpiGrid, Notice, ScreenTitle } from '@/components/ui';
import { giftSummary } from '@/domain/gifts';
import { fullName } from '@/domain/guests';
import { totalsToList } from '@/domain/money';
import { exportReport } from '@/features/exporter';
import { mutate, useSnapshot } from '@/hooks/useData';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/session';

/** Gifts & financial contributions (records only: no payment is processed in the app). */
export default function Gifts() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPremium = useIsPremium();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: snap } = useSnapshot(id);
  const [filter, setFilter] = useState<'all' | 'toThank' | 'gift' | 'contribution'>('all');
  if (!snap) return null;
  const s = giftSummary(snap.gifts);
  const totals = totalsToList(s.contributionTotals, snap.event.currency);
  const names = new Map(snap.guests.map((g) => [g.id, fullName(g)]));
  const list = snap.gifts.filter((g) => (filter === 'all' ? true : filter === 'toThank' ? !g.thanked : g.kind === filter));

  return (
    <Screen edges={[]} footer={<Button label={t('gifts.add')} icon="add" onPress={() => router.push({ pathname: '/event/[id]/gift', params: { id } })} testID="gift-add" />}>
      <ScreenTitle
        title={t('modules.gifts')}
        right={
          <IconButton
            icon="share-outline"
            label={t('reports.export')}
            onPress={() =>
              Alert.alert(t('reports.export'), undefined, [
                { text: 'PDF', onPress: () => void exportReport({ t, snap, kind: 'gifts', format: 'pdf', isPremium }) },
                { text: 'CSV', onPress: () => void exportReport({ t, snap, kind: 'gifts', format: 'csv', isPremium }) },
                { text: t('common.cancel'), style: 'cancel' },
              ])
            }
          />
        }
      />
      <KpiGrid>
        <Kpi icon="gift" value={fmt.number(s.gifts)} label={t('gifts.gifts')} />
        <Kpi icon="cash" tone="accent" value={totals.length ? totals.map((x) => fmt.money(x.amountMinor, x.currency)).join(' + ') : '—'} label={t('gifts.contributionTotal')} />
        <Kpi icon="heart" tone={s.toThank ? 'warning' : 'success'} value={fmt.number(s.toThank)} label={t('gifts.toThank')} onPress={() => setFilter('toThank')} />
        <Kpi icon="checkmark-done" tone="success" value={fmt.number(s.thanked)} label={t('gifts.thankedCount')} />
      </KpiGrid>
      <Notice icon="information-circle">{t('gifts.noPayments')}</Notice>
      <ChoiceChips value={filter} onChange={setFilter} options={(['all', 'toThank', 'gift', 'contribution'] as const).map((f) => ({ value: f, label: t(`gifts.filter.${f}`) }))} />
      {list.length === 0 ? (
        <EmptyState icon="gift-outline" title={t('gifts.emptyTitle')} message={t('gifts.emptyBody')} />
      ) : (
        <Card>
          {list.map((g) => (
            <Row key={g.id} gap={3} style={{ minHeight: 60 }}>
              <Pressable onPress={() => void mutate((r) => r.gifts.setThanked(g.id, !g.thanked))} accessibilityRole="checkbox" accessibilityState={{ checked: g.thanked }} accessibilityLabel={t('gift.thanked')} hitSlop={8}>
                <Icon name={g.thanked ? 'heart' : 'heart-outline'} size={24} color={g.thanked ? theme.colors.success : theme.colors.textMuted} />
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/event/[id]/gift', params: { id, giftId: g.id } })} accessibilityRole="button">
                <Text numberOfLines={1}>{g.guestId ? (names.get(g.guestId) ?? g.contributor) : g.contributor}</Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {[g.kind === 'contribution' ? fmt.money(g.amountMinor, g.currency) : g.description, g.receivedDate ? fmt.dayShort(g.receivedDate) : null].filter(Boolean).join(' · ')}
                </Text>
              </Pressable>
              <View>
                <Icon name={g.kind === 'contribution' ? 'cash-outline' : 'gift-outline'} size={18} color={theme.colors.textSubtle} />
              </View>
            </Row>
          ))}
        </Card>
      )}
    </Screen>
  );
}
