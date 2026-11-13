import { addDays, fromDayKey } from '@factory/app-core';
import { Button, Chip, Row, Screen, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Field, Note } from '@/components/ui';
import { repos } from '@/database';
import { categorize, ingredientName, keyForName } from '@/domain/ingredients';
import { parseQuantity } from '@/domain/quantity';
import { PANTRY_LOCATIONS, type PantryLocation, type UnitId } from '@/domain/types';
import { unitsForPicker } from '@/domain/units';
import { useLang } from '@/hooks/useLang';
import { fmt } from '@/i18n';
import { clock } from '@/services/clock';
import { scheduleSync } from '@/services/planning';
import { dataChanged } from '@/store/session';

/** Add or edit a pantry item. Expiry date is optional, chosen with quick offsets. */
export default function PantryEdit() {
  const { t, lng, system } = useLang();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<UnitId>('pc');
  const [location, setLocation] = useState<PantryLocation>('fridge');
  const [expiresOn, setExpiresOn] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);
  const today = clock.today();

  useEffect(() => {
    if (!id) return;
    void repos()
      .pantry.get(Number(id))
      .then((p) => {
        if (!p) return;
        setName(p.name);
        setQty(p.quantity === null ? '' : String(p.quantity));
        setUnit(p.unit);
        setLocation(p.location);
        setExpiresOn(p.expiresOn);
        setKey(p.key);
      });
  }, [id]);

  const save = async () => {
    if (!name.trim()) return;
    const k = key && ingredientName(key, lng, name) === name ? key : keyForName(name);
    const input = { key: k, name: name.trim(), category: categorize(k, name), quantity: unit === 'to_taste' ? null : parseQuantity(qty), unit, location, expiresOn };
    if (id) await repos().pantry.update(Number(id), input);
    else await repos().pantry.add(input);
    dataChanged();
    scheduleSync(t, lng);
    router.back();
  };

  const remove = async () => {
    if (id) await repos().pantry.remove(Number(id));
    dataChanged();
    scheduleSync(t, lng);
    router.back();
  };

  const offsets = [1, 3, 5, 7, 14, 30, 90];

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {id ? (
            <View style={{ flex: 1 }}>
              <Button label={t('common.delete')} variant="danger" onPress={remove} />
            </View>
          ) : null}
          <View style={{ flex: 2 }}>
            <Button label={t('common.save')} icon="checkmark" onPress={save} disabled={!name.trim()} testID="pantry-save" />
          </View>
        </Row>
      }
    >
      <Field label={t('pantry.product')} value={name} onChangeText={(v) => { setName(v); setKey(null); }} placeholder={t('pantry.productPlaceholder')} maxLength={60} autoFocus={!id} testID="pantry-name" />
      <Row gap={2}>
        <Field label={t('editor.qty')} value={qty} onChangeText={setQty} keyboardType="decimal-pad" style={{ width: 110 }} maxLength={8} hint={t('pantry.qtyOptional')} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="caption" tone="muted">
            {t('grocery.unit')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {unitsForPicker(system).filter((u) => u !== 'pinch').map((u) => (
              <Chip key={u} label={t(`unitsShort.${u}`)} selected={unit === u} onPress={() => setUnit(u)} />
            ))}
          </ScrollView>
        </View>
      </Row>
      <Text variant="label" tone="muted">
        {t('pantry.location')}
      </Text>
      <Row gap={2} wrap>
        {PANTRY_LOCATIONS.map((l) => (
          <Chip key={l} label={t(`pantry.locations.${l}`)} selected={location === l} onPress={() => setLocation(l)} />
        ))}
      </Row>
      <Text variant="label" tone="muted">
        {t('pantry.expiry')}
      </Text>
      <Row gap={2} wrap>
        <Chip label={t('pantry.noDate')} selected={expiresOn === null} onPress={() => setExpiresOn(null)} />
        {offsets.map((d) => (
          <Chip key={d} label={t('pantry.inDays', { count: d })} selected={expiresOn === addDays(today, d)} onPress={() => setExpiresOn(addDays(today, d))} />
        ))}
      </Row>
      {expiresOn ? (
        <Row gap={2}>
          <Button label="−1" size="md" variant="secondary" onPress={() => setExpiresOn(addDays(expiresOn, -1))} />
          <Text variant="subheading" style={{ flex: 1, textAlign: 'center' }}>
            {fmt.date(fromDayKey(expiresOn), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <Button label="+1" size="md" variant="secondary" onPress={() => setExpiresOn(addDays(expiresOn, 1))} />
        </Row>
      ) : null}
      <Note>{t('pantry.expiryNote')}</Note>
    </Screen>
  );
}
