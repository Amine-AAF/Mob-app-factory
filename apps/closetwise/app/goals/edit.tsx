import { diffDays } from '@factory/app-core';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import { ItemPhoto } from '@/components/ItemPhoto';
import { ItemPickerSheet } from '@/components/ItemPickerSheet';
import { confirmDelete, DateField, todayKey } from '@/components/forms';
import { repos } from '@/database';
import { parseAmount } from '@/domain/budget';
import { defaultEndDate, templateFor } from '@/domain/goals';
import { GOAL_KINDS, type DayKey, type GoalKind } from '@/domain/types';
import { goalUnit, isCapsuleGoal, isValidTarget } from '@/features/goals/goalCopy';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { useSettings } from '@/store/session';
import { Button, Card, ChoiceChips, EmptyState, Field, FieldLabel, Loading, Row, Screen, Stack, Text } from '@/ui/components';
import { useTheme } from '@/ui/ThemeProvider';

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const isKind = (k: string | undefined): k is GoalKind => !!k && (GOAL_KINDS as readonly string[]).includes(k);

export default function GoalEditScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const settings = useSettings();
  const params = useLocalSearchParams<{ id?: string; kind?: string }>();
  const id = one(params.id);
  const kindParam = one(params.kind);

  const { data } = useAsync(async () => {
    const [goal, items] = await Promise.all([id ? repos().goals.get(id) : Promise.resolve(null), repos().wardrobe.list()]);
    return { goal, items };
  }, [id]);

  const initialKind: GoalKind = isKind(kindParam) ? kindParam : 'wear_forgotten';
  const [ready, setReady] = useState(false);
  const [kind, setKind] = useState<GoalKind>(initialKind);
  const [target, setTarget] = useState(String(templateFor(initialKind).defaultTarget));
  const [startDate, setStartDate] = useState<DayKey | null>(todayKey());
  const [endDate, setEndDate] = useState<DayKey | null>(defaultEndDate(initialKind, todayKey()));
  const [endTouched, setEndTouched] = useState(false);
  const [title, setTitle] = useState('');
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<{ target?: string; dates?: string }>({});
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  if (data && !ready) {
    setReady(true);
    const g = data.goal;
    if (g) {
      setKind(g.kind);
      setTarget(String(g.target));
      setStartDate(g.startDate);
      setEndDate(g.endDate);
      setEndTouched(true);
      setTitle(g.title ?? '');
      setItemIds(g.payload.itemIds ?? []);
    }
  }

  if (!data || !ready) return <Loading />;
  if (id && !data.goal && !finished) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title: t('goals.edit.titleEdit') }} />
        <EmptyState icon="alert-circle-outline" title={t('goals.edit.notFound')} action={<Button label={t('common.back')} onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const unit = goalUnit(kind);
  const capsule = isCapsuleGoal(kind);
  const unitLabel = {
    items: t('goals.unit.items'),
    purchases: t('goals.unit.purchases'),
    outfits: t('goals.unit.outfits'),
    amount: t('goals.unit.amount', { currency: settings.currency }),
    percent: t('goals.unit.percent'),
    days: t('goals.unit.days'),
    pieces: t('goals.unit.pieces'),
  }[unit];
  const itemById = new Map(data.items.map((i) => [i.id, i]));
  const pickedItems = itemIds.map((x) => itemById.get(x)).filter((x) => x != null);

  const changeKind = (k: GoalKind | null) => {
    if (!k || k === kind) return;
    setKind(k);
    setTarget(String(templateFor(k).defaultTarget));
    if (!endTouched && startDate) setEndDate(defaultEndDate(k, startDate));
    setErrors({});
  };

  const changeStart = (d: DayKey | null) => {
    setStartDate(d);
    if (!endTouched && d) setEndDate(defaultEndDate(kind, d));
  };

  const save = async () => {
    const value = unit === 'amount' ? parseAmount(target) : Number(target.trim());
    const next: typeof errors = {};
    if (!isValidTarget(kind, value)) next.target = unit === 'percent' ? t('goals.edit.targetPercentInvalid') : t('goals.edit.targetInvalid');
    if (!startDate) next.dates = t('goals.edit.startRequired');
    else if (endDate && diffDays(startDate, endDate) < 0) next.dates = t('goals.edit.datesInvalid');
    setErrors(next);
    if (Object.keys(next).length > 0 || !isValidTarget(kind, value) || !startDate) return;
    setBusy(true);
    try {
      await repos().goals.save(
        {
          kind,
          title: title.trim() || null,
          target: value,
          startDate,
          endDate,
          status: data.goal?.status ?? 'active',
          payload: capsule ? { itemIds } : {},
        },
        id,
      );
      setFinished(true);
      afterWrite({ notifications: true });
      router.back();
    } catch (e) {
      recordError(e, 'goal_save');
      Alert.alert(t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    confirmDelete(t, async () => {
      if (!id) return;
      try {
        setFinished(true);
        await repos().goals.remove(id);
        afterWrite({ notifications: true });
        router.back();
      } catch (e) {
        recordError(e, 'goal_delete');
        Alert.alert(t('common.error'));
      }
    });

  return (
    <Screen
      edges={[]}
      footer={
        <Row gap={2}>
          {id ? <Button variant="danger" label={t('common.delete')} icon="trash-outline" onPress={remove} disabled={busy} /> : null}
          <Button label={id ? t('common.save') : t('goals.edit.start')} onPress={save} loading={busy} style={{ flex: 1 }} testID="goal-save" />
        </Row>
      }
    >
      <RouterStack.Screen options={{ title: id ? t('goals.edit.titleEdit') : t('goals.edit.titleNew') }} />
      <ChoiceChips label={t('goals.edit.kind')} options={GOAL_KINDS.map((k) => ({ value: k, label: t(`catalog.goal.${k}`) }))} value={kind} onChange={changeKind} />
      <Card tone="alt">
        <Text variant="bodySmall" tone="muted">
          {t(`goals.templateDesc.${kind}`)}
        </Text>
      </Card>
      <Field
        label={t('goals.edit.target', { unit: unitLabel })}
        value={target}
        onChangeText={(s) => {
          setTarget(s);
          if (errors.target) setErrors((e) => ({ ...e, target: undefined }));
        }}
        keyboardType={unit === 'amount' ? 'decimal-pad' : 'number-pad'}
        error={errors.target}
        hint={t(`goals.targetHint.${kind}`)}
        testID="goal-target"
      />
      <DateField label={t('goals.edit.startDate')} value={startDate} onChange={changeStart} />
      <DateField
        label={`${t('goals.edit.endDate')} · ${t('common.optional')}`}
        value={endDate}
        onChange={(d) => {
          setEndTouched(true);
          setEndDate(d);
        }}
        allowClear
      />
      {errors.dates ? (
        <Text variant="caption" tone="danger">
          {errors.dates}
        </Text>
      ) : !endDate ? (
        <Text variant="caption" tone="subtle">
          {t('goals.edit.noEndHint')}
        </Text>
      ) : null}
      <Field label={`${t('goals.edit.customTitle')} · ${t('common.optional')}`} value={title} onChangeText={setTitle} placeholder={t(`catalog.goal.${kind}`)} maxLength={80} />

      {capsule ? (
        <Stack gap={2}>
          <FieldLabel>{t('goals.edit.capsuleItems')}</FieldLabel>
          <Text variant="bodySmall" tone="muted">
            {t('goals.edit.capsuleHint', { count: pickedItems.length })}
          </Text>
          {pickedItems.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(2) }}>
              {pickedItems.slice(0, 30).map((i) => (
                <View key={i.id} style={{ width: 56 }}>
                  <ItemPhoto photoPath={i.photoPath} thumbPath={i.thumbPath} categoryKey={labels.categoryKey(i.categoryId)} color={i.primaryColor} accessibilityLabel={i.name} />
                </View>
              ))}
            </ScrollView>
          ) : null}
          <Button small variant="secondary" icon="albums-outline" label={t('goals.edit.pickCapsule')} onPress={() => setPickerOpen(true)} style={{ alignSelf: 'flex-start' }} disabled={data.items.length === 0} />
          <ItemPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} items={data.items} title={t('goals.edit.capsuleItems')} multiple selected={itemIds} onConfirm={setItemIds} />
        </Stack>
      ) : null}
    </Screen>
  );
}
