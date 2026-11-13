import { addDays, diffDays, fromDayKey } from '@factory/app-core';
import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import { Note, useQuantityLabel } from '@/components/ui';
import { groupByCategory } from '@/domain/grocery';
import { useAsync } from '@/hooks/useAsync';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { draftsForRange, generateGroceryList } from '@/services/planning';

/** Preview of the ingredients needed for a date range, then create or refresh the list. */
export default function GenerateGrocery() {
  const { t, lng, system } = useLang();
  const q = useQuantityLabel();
  const params = useLocalSearchParams<{ from: string; to: string; refresh?: string }>();
  const [from, setFrom] = useState(params.from);
  const [days, setDays] = useState(Math.max(1, diffDays(params.from, params.to) + 1));
  const [usePantry, setUsePantry] = useState(true);
  const [refresh, setRefresh] = useState(params.refresh === '1');
  const [busy, setBusy] = useState(false);
  const to = addDays(from, days - 1);

  const { data } = useAsync(() => draftsForRange(from, to, { lng, system, usePantry }), [from, to, lng, system, usePantry]);

  const create = async () => {
    setBusy(true);
    try {
      const name = t('grocery.listName', { from: fmt.date(fromDayKey(from), { day: 'numeric', month: 'short' }), to: fmt.date(fromDayKey(to), { day: 'numeric', month: 'short' }) });
      await generateGroceryList(from, to, { lng, system, usePantry, name, refreshActive: refresh });
      router.back();
      router.navigate('/(tabs)/grocery');
    } finally {
      setBusy(false);
    }
  };

  const sections = groupByCategory((data?.drafts ?? []).map((d) => ({ ...d, checked: false })));

  return (
    <Screen edges={[]} footer={<Button label={refresh ? t('grocery.refreshList') : t('grocery.createList')} icon="cart" onPress={create} disabled={!data || data.drafts.length === 0 || busy} loading={busy} testID="generate-create" />}>
      <Text variant="subheading">{t('grocery.period')}</Text>
      <Row gap={2} wrap>
        {[1, 3, 7, 14].map((n) => (
          <Chip key={n} label={t('grocery.days', { count: n })} selected={days === n} onPress={() => setDays(n)} />
        ))}
      </Row>
      <Row gap={2} wrap>
        <Chip label={t('grocery.startToday')} selected={from === clock.today()} onPress={() => setFrom(clock.today())} />
        <Text variant="bodySmall" tone="muted" style={{ alignSelf: 'center' }}>
          {fmt.date(fromDayKey(from), { weekday: 'short', day: 'numeric', month: 'short' })} → {fmt.date(fromDayKey(to), { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
      </Row>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{t('grocery.usePantry')}</Text>
            <Text variant="caption" tone="muted">
              {t('grocery.usePantryHint')}
            </Text>
          </View>
          <Switch value={usePantry} onValueChange={setUsePantry} accessibilityLabel={t('grocery.usePantry')} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">{t('grocery.refreshActive')}</Text>
            <Text variant="caption" tone="muted">
              {t('grocery.refreshActiveHint')}
            </Text>
          </View>
          <Switch value={refresh} onValueChange={setRefresh} accessibilityLabel={t('grocery.refreshActive')} />
        </Row>
      </Card>

      {data ? (
        <Text variant="bodySmall" tone="muted" testID="generate-summary">
          {t('grocery.previewSummary', { meals: data.meals, items: data.drafts.length, covered: data.covered })}
        </Text>
      ) : null}
      {data && data.meals === 0 ? <Note tone="warning">{t('grocery.noMeals')}</Note> : null}

      {sections.map((s) => (
        <Card key={s.category}>
          <Text variant="label" tone="muted">
            {t(`groceryCategories.${s.category}`)}
          </Text>
          <Stack gap={1}>
            {s.items.map((d) => (
              <Row key={`${d.key}-${d.unit}`} style={{ justifyContent: 'space-between' }}>
                <Text style={{ flex: 1 }}>{d.name}</Text>
                <Text variant="bodySmall" tone="muted">
                  {d.quantity === null ? t('units.to_taste') : q(d.quantity, d.unit, { original: true })}
                  {d.pantry === 'partial' ? ` · ${t('grocery.partlyInPantry')}` : d.pantry === 'unknown' ? ` · ${t('grocery.checkPantry')}` : ''}
                </Text>
              </Row>
            ))}
          </Stack>
        </Card>
      ))}
      <Note>{t('grocery.mergeNote')}</Note>
    </Screen>
  );
}

