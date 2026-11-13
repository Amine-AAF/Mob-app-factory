import { Button, Card, Chip, Row, Screen, Stack, Text } from '@factory/design-system';
import { addDays, fromDayKey } from '@factory/app-core';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChipScroller, Field, InfoNote, KeyValue } from '@/components/ui';
import { repos } from '@/database';
import { estimateCaloriesMet, paceSecPer, speedKmh, validateCardio } from '@/features/cardio/cardio';
import { displayToMeters, M_PER_MI, metersToDisplay, parseDuration, roundDisplay } from '@/features/units';
import { useData, useFormat } from '@/hooks';
import { fmt } from '@/i18n';
import { track } from '@/services/analytics';
import { evaluateAchievements } from '@/services/progressService';
import { useSession } from '@/store/session';
import { CARDIO_TYPES, type CardioType } from '@/types';
import { cleanText, parseDecimal } from '@/utils';

/** Log or edit a cardio activity. Speed and pace are computed only from what was entered. */
export default function CardioEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { t } = useTranslation();
  const today = useSession((s) => s.today);
  const f = useFormat();
  const { data: weight } = useData((r) => r.body.latest('weight'));
  const [type, setType] = useState<CardioType>('running');
  const [day, setDay] = useState(today);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [caloriesSource, setCaloriesSource] = useState<'manual' | 'met_estimate' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos().cardio.get(id).then((a) => {
      if (!a) return;
      setType(a.type);
      setDay(a.day);
      setDuration(String(Math.round(a.durationSec / 60 * 100) / 100));
      setDistance(a.distanceM ? String(roundDisplay(metersToDisplay(a.distanceM, f.units.distance), 2)) : '');
      setCalories(a.calories ? String(a.calories) : '');
      setCaloriesSource(a.caloriesSource);
      setNote(a.note ?? '');
    });
  }, [id, f.units.distance]);

  const durationSec = parseDuration(duration);
  const d = parseDecimal(distance);
  const distanceM = d === null ? null : displayToMeters(d, f.units.distance);
  const cal = parseDecimal(calories);
  const perUnit = f.units.distance === 'km' ? 1000 : M_PER_MI;
  const estimate = durationSec ? estimateCaloriesMet(type, durationSec, weight?.value ?? null) : null;

  const save = async () => {
    const err = validateCardio({ durationSec, distanceM, calories: cal });
    if (err) return setError(t(`cardio.errors.${err}`));
    const input = { day, type, durationSec: durationSec!, distanceM, calories: cal, caloriesSource: cal === null ? null : (caloriesSource ?? 'manual'), note: cleanText(note, 300) };
    const r = repos();
    if (id) await r.cardio.update(id, input);
    else {
      await r.cardio.add(input);
      track('cardio_logged', { type });
    }
    await evaluateAchievements(r);
    useSession.getState().bump();
    router.back();
  };

  const remove = () =>
    Alert.alert(t('cardio.deleteTitle'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await repos().cardio.remove(id!); useSession.getState().bump(); router.back(); } },
    ]);

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={() => void save()} testID="save-cardio" />}>
      <Row wrap gap={2}>{CARDIO_TYPES.map((c) => <Chip key={c} label={t(`cardio.types.${c}`)} selected={type === c} onPress={() => setType(c)} />)}</Row>
      <Stack gap={2}>
        <Text variant="label" tone="muted">{t('planner.date')}</Text>
        <ChipScroller>
          {Array.from({ length: 14 }, (_, i) => addDays(today, -i)).map((x) => <Chip key={x} label={x === today ? t('home.today') : fmt.shortDay(fromDayKey(x))} selected={day === x} onPress={() => setDay(x)} />)}
        </ChipScroller>
      </Stack>
      <Field label={t('cardio.duration')} value={duration} onChangeText={(s) => { setDuration(s); setError(null); }} placeholder={t('cardio.durationPlaceholder')} keyboardType="numbers-and-punctuation" testID="cardio-duration" error={error} />
      <Field label={t('cardio.distanceWithUnit', { unit: t(`units.${f.units.distance}`) })} value={distance} onChangeText={(s) => { setDistance(s); setError(null); }} keyboardType="decimal-pad" testID="cardio-distance" />
      {durationSec && distanceM ? (
        <Card tone="alt">
          <KeyValue label={t('cardio.avgSpeed')} value={f.speed(speedKmh(distanceM, durationSec))} />
          <KeyValue label={t('cardio.pace')} value={f.pace(paceSecPer(distanceM, durationSec, perUnit))} />
          <Text variant="caption" tone="subtle">{t('cardio.computedNote')}</Text>
        </Card>
      ) : null}
      <Field label={t('cardio.calories')} value={calories} onChangeText={(s) => { setCalories(s); setCaloriesSource('manual'); }} keyboardType="number-pad" placeholder={t('cardio.optional')} />
      {estimate !== null ? (
        <Button label={t('cardio.useEstimate', { value: estimate })} variant="ghost" size="md" onPress={() => { setCalories(String(estimate)); setCaloriesSource('met_estimate'); }} />
      ) : (
        <Text variant="caption" tone="subtle">{t('cardio.estimateNeedsWeight')}</Text>
      )}
      <InfoNote text={t('cardio.caloriesNote')} icon="calculator-outline" />
      <Field label={t('body.note')} value={note} onChangeText={setNote} multiline maxLength={300} />
      {id ? <Button label={t('common.delete')} variant="danger" onPress={remove} /> : null}
    </Screen>
  );
}
