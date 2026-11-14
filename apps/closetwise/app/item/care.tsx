import { Stack as RouterStack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { confirmDelete, DateField } from '@/components/forms';
import { ItemPhoto } from '@/components/ItemPhoto';
import { repos } from '@/database';
import { CARE_LOG_KINDS, DRYING_METHODS, IRONING_LEVELS, WASH_METHODS, type CareLogKind, type DryingMethod, type IroningLevel, type WashMethod } from '@/domain/catalog';
import type { CareInstructions } from '@/domain/types';
import { parseTemperature } from '@/features/wardrobe/logic';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { Button, Card, Chip, ChoiceChips, Divider, EmptyState, Field, Icon, IconButton, Loading, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@/ui';

type Bleach = 'yes' | 'no';
const TEMPERATURE_PRESETS = ['30', '40', '60'] as const;

interface CareForm {
  washMethod: WashMethod | null;
  temperature: string;
  drying: DryingMethod | null;
  ironing: IroningLevel | null;
  bleach: Bleach | null;
  notes: string;
}

const fromInstructions = (c: CareInstructions | null): CareForm => ({
  washMethod: c?.washMethod ?? null,
  temperature: c?.washTemperature == null ? '' : String(c.washTemperature),
  drying: c?.drying ?? null,
  ironing: c?.ironing ?? null,
  bleach: c?.bleach == null ? null : c.bleach ? 'yes' : 'no',
  notes: c?.notes ?? '',
});

export default function ItemCareScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = String(rawId ?? '');
  const { data, loading } = useAsync(async () => {
    const r = repos();
    const item = await r.wardrobe.get(id);
    if (!item) return { item: null, instructions: null, history: [] };
    const [instructions, history] = await Promise.all([r.care.instructions(id), r.care.history(id)]);
    return { item, instructions, history };
  }, [id]);

  const [form, setForm] = useState<CareForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [logDay, setLogDay] = useState(clock.today());

  // Prefill once the record is loaded (state derived during render, no effect needed).
  if (data && form === null) setForm(fromInstructions(data.instructions));

  const title = t('care.instructionsTitle');
  if (!data || !form) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        <Loading />
      </Screen>
    );
  }
  if (!data.item) {
    return (
      <Screen edges={[]}>
        <RouterStack.Screen options={{ title }} />
        {loading ? <Loading /> : <EmptyState icon="help-circle-outline" title={t('item.notFoundTitle')} message={t('item.notFoundMessage')} action={<Button variant="secondary" label={t('common.back')} onPress={() => router.back()} />} />}
      </Screen>
    );
  }
  const item = data.item;
  const temp = parseTemperature(form.temperature);
  const tempError = temp.valid ? null : t('care.temperatureInvalid');
  const patch = (p: Partial<CareForm>) => {
    setSavedAt(false);
    setForm((f) => (f ? { ...f, ...p } : f));
  };

  const save = async () => {
    if (!temp.valid) return;
    setSaving(true);
    try {
      await repos().care.saveInstructions(
        item.id,
        { washMethod: form.washMethod, washTemperature: temp.value, drying: form.drying, ironing: form.ironing, bleach: form.bleach == null ? null : form.bleach === 'yes', notes: form.notes.trim() || null },
        clock.today(),
      );
      afterWrite();
      setSavedAt(true);
    } catch (e) {
      recordError(e, 'save_care');
      Alert.alert(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const log = async (kind: CareLogKind) => {
    try {
      await repos().care.log(item.id, kind, logDay);
      afterWrite();
    } catch (e) {
      recordError(e, 'care_log');
      Alert.alert(t('common.error'));
    }
  };

  const removeLog = (logId: string) =>
    confirmDelete(t, () => {
      repos()
        .care.removeLog(logId)
        .then(() => afterWrite())
        .catch((e) => {
          recordError(e, 'care_log_delete');
          Alert.alert(t('common.error'));
        });
    }, t('care.deleteLogTitle'));

  return (
    <Screen edges={[]} footer={<Button label={savedAt ? t('common.saved') : t('common.save')} icon="checkmark" onPress={save} loading={saving} disabled={!!tempError} testID="care-save" />}>
      <RouterStack.Screen options={{ title }} />
      <Row gap={3}>
        <ItemPhoto photoPath={item.photoPath} thumbPath={item.thumbPath} categoryKey={labels.categoryKey(item.categoryId)} color={item.primaryColor} style={{ width: 52 }} />
        <Stack gap={0.5} style={{ flex: 1 }}>
          <Text variant="heading" numberOfLines={2}>
            {item.name}
          </Text>
          <Text variant="caption" tone="subtle">
            {labels.category(item.categoryId)}
          </Text>
        </Stack>
      </Row>

      <Card tone="accent">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="pricetag-outline" size={18} color={theme.colors.text} />
          <Text style={{ flex: 1 }}>{t('care.labelNote')}</Text>
        </Row>
      </Card>

      <ChoiceChips label={t('care.washMethod')} options={WASH_METHODS.map((m) => ({ value: m, label: t(`catalog.washMethod.${m}`) }))} value={form.washMethod} onChange={(washMethod) => patch({ washMethod })} allowNone />

      <Stack gap={2}>
        <Field
          label={t('care.temperature')}
          value={form.temperature}
          onChangeText={(temperature) => patch({ temperature: temperature.replace(/[^\d]/g, '') })}
          keyboardType="number-pad"
          maxLength={2}
          placeholder={t('care.temperaturePlaceholder')}
          error={tempError}
          testID="care-temperature"
        />
        <Row gap={2}>
          {TEMPERATURE_PRESETS.map((p) => (
            <Chip key={p} label={t('care.degrees', { value: p })} selected={form.temperature === p} onPress={() => patch({ temperature: form.temperature === p ? '' : p })} />
          ))}
        </Row>
      </Stack>

      <ChoiceChips label={t('care.drying')} options={DRYING_METHODS.map((m) => ({ value: m, label: t(`catalog.drying.${m}`) }))} value={form.drying} onChange={(drying) => patch({ drying })} allowNone />
      <ChoiceChips label={t('care.ironing')} options={IRONING_LEVELS.map((m) => ({ value: m, label: t(`catalog.ironing.${m}`) }))} value={form.ironing} onChange={(ironing) => patch({ ironing })} allowNone />
      <ChoiceChips<Bleach>
        label={t('care.bleach')}
        options={[
          { value: 'yes', label: t('care.bleachYes') },
          { value: 'no', label: t('care.bleachNo') },
        ]}
        value={form.bleach}
        onChange={(bleach) => patch({ bleach })}
        allowNone
      />
      <Text variant="caption" tone="subtle">
        {t('care.unspecifiedHint')}
      </Text>
      <Field label={t('care.notes')} value={form.notes} onChangeText={(notes) => patch({ notes })} placeholder={t('care.notesPlaceholder')} multiline maxLength={500} />

      <Divider />
      <SectionHeader title={t('care.history')} />
      <Card tone="alt">
        <DateField label={t('care.logDate')} value={logDay} onChange={(d) => d && setLogDay(d)} />
        <Row gap={2} wrap>
          {CARE_LOG_KINDS.map((k) => (
            <Button key={k} small variant="secondary" icon="add" label={t(`catalog.careLog.${k}`)} onPress={() => void log(k)} testID={`care-log-${k}`} />
          ))}
        </Row>
      </Card>
      {data.history.length ? (
        <Stack gap={0}>
          {data.history.map((h) => (
            <Row key={h.id} gap={3} style={{ minHeight: 52 }}>
              <Stack gap={0.5} style={{ flex: 1 }}>
                <Text>{t(`catalog.careLog.${h.kind}`)}</Text>
                <Text variant="caption" tone="subtle">
                  {fmt.day(h.recordedOn)}
                </Text>
              </Stack>
              <IconButton icon="trash-outline" tone="danger" size={18} label={t('care.deleteLog')} onPress={() => removeLog(h.id)} />
            </Row>
          ))}
        </Stack>
      ) : (
        <Text tone="muted">{t('care.historyEmpty')}</Text>
      )}
    </Screen>
  );
}
