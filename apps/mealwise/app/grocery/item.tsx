import { Button, Chip, Row, Screen, Text } from '@factory/design-system';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Field, Note } from '@/components/ui';
import { repos } from '@/database';
import { parseAmount } from '@/domain/budget';
import { parseQuantity } from '@/domain/quantity';
import { GROCERY_CATEGORIES, type GroceryCategory, type GroceryItem, type UnitId } from '@/domain/types';
import { unitsForPicker } from '@/domain/units';
import { useLang } from '@/hooks/useLang';
import { dataChanged } from '@/store/session';

/** Edit one grocery item: name, quantity, unit, aisle, estimated price, note. */
export default function GroceryItemScreen() {
  const { t, system, currency } = useLang();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<GroceryItem | null>(null);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<UnitId>('pc');
  const [category, setCategory] = useState<GroceryCategory>('other');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [savePrice, setSavePrice] = useState(true);

  useEffect(() => {
    void (async () => {
      const found = await repos().grocery.item(Number(id));
      if (!found) return;
      setItem(found);
      setName(found.name);
      setQty(found.quantity === null ? '' : String(found.quantity));
      setUnit(found.unit);
      setCategory(found.category);
      setPrice(found.price === null ? '' : String(found.price));
      setNote(found.note ?? '');
    })();
  }, [id]);

  if (!item) return <Screen edges={[]}>{null}</Screen>;

  const save = async () => {
    const quantity = unit === 'to_taste' ? null : parseQuantity(qty);
    const p = price.trim() ? parseAmount(price) : null;
    await repos().grocery.updateItem(item.id, { name, quantity, unit, category, price: p, note: note.trim() || null });
    // Remember the price for recipe cost estimates (per quantity of this ingredient).
    if (savePrice && p !== null && quantity !== null && quantity > 0) await repos().budget.setPrice({ key: item.key, price: p, quantity, unit });
    dataChanged();
    router.back();
  };

  const remove = async () => {
    await repos().grocery.removeItem(item.id);
    dataChanged();
    router.back();
  };

  return (
    <Screen edges={[]} footer={<Row gap={2}><View style={{ flex: 1 }}><Button label={t('common.delete')} variant="danger" onPress={remove} /></View><View style={{ flex: 2 }}><Button label={t('common.save')} icon="checkmark" onPress={save} testID="item-save" /></View></Row>}>
      <Field label={t('grocery.itemName')} value={name} onChangeText={setName} maxLength={60} />
      <Row gap={2}>
        <Field label={t('editor.qty')} value={qty} onChangeText={setQty} keyboardType="decimal-pad" style={{ flex: 1 }} maxLength={8} />
        <Field label={t('grocery.price', { currency })} value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={{ flex: 1 }} maxLength={9} testID="item-price" />
      </Row>
      <Text variant="label" tone="muted">
        {t('grocery.unit')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {unitsForPicker(system).map((u) => (
          <Chip key={u} label={t(`unitsShort.${u}`)} selected={unit === u} onPress={() => setUnit(u)} />
        ))}
      </ScrollView>
      <Text variant="label" tone="muted">
        {t('grocery.aisle')}
      </Text>
      <Row gap={2} wrap>
        {GROCERY_CATEGORIES.map((c) => (
          <Chip key={c} label={t(`groceryCategories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </Row>
      <Field label={t('planner.note')} value={note} onChangeText={setNote} maxLength={120} />
      <Row gap={2}>
        <Chip label={t('grocery.rememberPrice')} icon="pricetag-outline" selected={savePrice} onPress={() => setSavePrice(!savePrice)} />
      </Row>
      <Note>{t('grocery.priceNote')}</Note>
    </Screen>
  );
}
