import { addDays } from '@factory/app-core';
import { Button, Card, EmptyState, IconButton, ProgressBar, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { CheckRow, Field, Note, useQuantityLabel } from '@/components/ui';
import { repos } from '@/database';
import { estimateTotal, groupByCategory, listProgress } from '@/domain/grocery';
import { categorize, ingredientName } from '@/domain/ingredients';
import { weekStart } from '@/domain/planner';
import { parseIngredientLine } from '@/domain/recipeImport';
import { formatMoney, parseAmount } from '@/domain/budget';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { clock } from '@/services/clock';
import { shareFile, shareText } from '@/services/files';
import { groceryListAsCsv, groceryListAsText } from '@/services/share';
import { usePreferences } from '@/store/preferences';
import { dataChanged, useIsPremium } from '@/store/session';

export default function Grocery() {
  const { t, lng, system, currency } = useLang();
  const theme = useTheme();
  const q = useQuantityLabel();
  const isPremium = useIsPremium();
  const firstDay = usePreferences((s) => s.firstDayOfWeek);
  const [line, setLine] = useState('');
  const [hideChecked, setHideChecked] = useState(false);
  const [spent, setSpent] = useState('');
  const [completing, setCompleting] = useState(false);

  const { data } = useAsync(async () => {
    const list = await repos().grocery.active();
    const items = list ? await repos().grocery.items(list.id) : [];
    return { list, items };
  }, []);

  const list = data?.list;
  const items = data?.items ?? [];
  const progress = listProgress(items);
  const total = estimateTotal(items);
  const sections = groupByCategory(hideChecked ? items.filter((i) => !i.checked) : items);
  const qty = (quantity: number | null, unit: Parameters<typeof q>[1]) => q(quantity, unit, { original: true });

  const start = weekStart(clock.today(), firstDay);

  const addLine = async () => {
    if (!list || !line.trim()) return;
    const parsed = parseIngredientLine(line);
    if (!parsed) return;
    const name = ingredientName(parsed.key, lng, parsed.name);
    await repos().grocery.addManual(list.id, { key: parsed.key, name, category: categorize(parsed.key, parsed.name), quantity: parsed.quantity, unit: parsed.unit === 'pc' && parsed.quantity === null ? 'to_taste' : parsed.unit, note: parsed.note ?? null }, system);
    setLine('');
    dataChanged();
  };

  const startEmpty = async () => {
    await repos().grocery.createList(t('grocery.defaultName'), { start: null, end: null });
    dataChanged();
  };

  const share = () => list && shareText(groceryListAsText(list.name, items, qty, t, { includeChecked: false }), list.name);

  const exportCsv = async () => {
    if (!list) return;
    if (!isPremium) return router.push({ pathname: '/paywall', params: { source: 'export_list' } });
    await shareFile(`mealwise-list-${clock.today()}.csv`, groceryListAsCsv(items, t), 'text/csv', t('grocery.export'));
  };

  const clearChecked = () =>
    list &&
    Alert.alert(t('grocery.clearCheckedTitle'), t('grocery.clearCheckedBody', { count: progress.done }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          await repos().grocery.removeChecked(list.id);
          dataChanged();
        },
      },
    ]);

  const complete = async () => {
    if (!list) return;
    await repos().grocery.complete(list.id, parseAmount(spent), clock.today());
    setCompleting(false);
    setSpent('');
    dataChanged();
  };

  if (data && !list) {
    return (
      <Screen testID="grocery-screen">
        <Text variant="title" accessibilityRole="header">
          {t('grocery.title')}
        </Text>
        <EmptyState
          icon="cart-outline"
          title={t('grocery.emptyTitle')}
          message={t('grocery.emptyBody')}
          action={
            <Stack gap={2} style={{ alignSelf: 'stretch' }}>
              <Button label={t('grocery.fromThisWeek')} icon="calendar-outline" onPress={() => router.push({ pathname: '/grocery/generate', params: { from: start, to: addDays(start, 6) } })} testID="grocery-generate" />
              <Button label={t('grocery.startEmpty')} variant="secondary" icon="add" onPress={startEmpty} testID="grocery-empty" />
              <Button label={t('grocery.history')} variant="ghost" icon="time-outline" onPress={() => router.push('/grocery/history')} />
            </Stack>
          }
        />
      </Screen>
    );
  }

  return (
    <Screen testID="grocery-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text variant="title" accessibilityRole="header" numberOfLines={1}>
            {list?.name ?? t('grocery.title')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('grocery.progress', { done: progress.done, total: progress.total })}
          </Text>
        </View>
        <IconButton icon="share-social-outline" label={t('common.share')} onPress={() => void share()} />
        <IconButton icon="time-outline" label={t('grocery.history')} onPress={() => router.push('/grocery/history')} />
      </Row>
      <ProgressBar progress={progress.ratio} tone="success" label={t('grocery.progress', { done: progress.done, total: progress.total })} />

      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Field value={line} onChangeText={setLine} placeholder={t('grocery.addPlaceholder')} testID="grocery-add-input" />
        </View>
        <IconButton icon="add-circle" tone="primary" label={t('grocery.addItem')} onPress={() => void addLine()} />
      </Row>

      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button label={t('grocery.fromPlan')} size="md" variant="secondary" icon="refresh" onPress={() => router.push({ pathname: '/grocery/generate', params: { from: list?.startDay ?? start, to: list?.endDay ?? addDays(start, 6), refresh: '1' } })} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={hideChecked ? t('grocery.showChecked') : t('grocery.hideChecked')} size="md" variant="secondary" icon={hideChecked ? 'eye-outline' : 'eye-off-outline'} onPress={() => setHideChecked(!hideChecked)} />
        </View>
      </Row>

      {items.length === 0 ? <EmptyState icon="basket-outline" title={t('grocery.listEmpty')} message={t('grocery.listEmptyHint')} /> : null}

      {sections.map((s) => (
        <Card key={s.category}>
          <Text variant="label" tone="muted">
            {t(`groceryCategories.${s.category}`)} · {s.items.length}
          </Text>
          {s.items.map((i) => (
            <CheckRow
              key={i.id}
              checked={i.checked}
              onToggle={async () => {
                await repos().grocery.toggle(i.id);
                dataChanged();
              }}
              onLongPress={() => router.push({ pathname: '/grocery/item', params: { id: String(i.id) } })}
              title={i.name}
              subtitle={[i.unit === 'to_taste' && i.quantity === null ? null : qty(i.quantity, i.unit), i.note].filter(Boolean).join(' · ') || undefined}
              right={
                <View style={{ alignItems: 'flex-end' }}>
                  {i.price !== null ? (
                    <Text variant="caption" tone="muted">
                      {formatMoney(i.price, currency, lng)}
                    </Text>
                  ) : null}
                  <IconButton icon="ellipsis-horizontal" size={18} label={t('grocery.editItem', { name: i.name })} onPress={() => router.push({ pathname: '/grocery/item', params: { id: String(i.id) } })} />
                </View>
              }
              testID={`grocery-item-${i.id}`}
            />
          ))}
        </Card>
      ))}

      {items.length ? (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('grocery.estimatedTotal')}</Text>
            <Text variant="heading">{total.priced ? formatMoney(total.total, currency, lng) : '—'}</Text>
          </Row>
          <Text variant="caption" tone="muted">
            {t('grocery.pricedItems', { priced: total.priced, count: total.count })}
          </Text>
          <Note>{t('grocery.priceNote')}</Note>
        </Card>
      ) : null}

      {completing ? (
        <Card tone="accent">
          <Field label={t('grocery.amountSpent', { currency })} value={spent} onChangeText={setSpent} keyboardType="decimal-pad" placeholder={total.priced ? String(total.total) : '0'} testID="grocery-spent" />
          <Row gap={2}>
            <View style={{ flex: 1 }}>
              <Button label={t('common.cancel')} variant="secondary" size="md" onPress={() => setCompleting(false)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('grocery.finish')} size="md" icon="checkmark-done" onPress={() => void complete()} testID="grocery-finish" />
            </View>
          </Row>
        </Card>
      ) : items.length ? (
        <Button label={t('grocery.doneShopping')} icon="bag-check-outline" onPress={() => setCompleting(true)} testID="grocery-complete" />
      ) : null}

      <Row gap={2}>
        <View style={{ flex: 1 }}>
          <Button label={t('grocery.clearChecked')} variant="ghost" size="md" onPress={clearChecked} disabled={progress.done === 0} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label={t('grocery.export')} variant="ghost" size="md" icon={isPremium ? 'download-outline' : 'lock-closed-outline'} onPress={() => void exportCsv()} />
        </View>
      </Row>
      <View style={{ height: theme.spacing(2) }} />
    </Screen>
  );
}
