import { Button, Screen, Stack as UIStack, Text } from '@factory/design-system';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { MedicalDisclaimer } from '@/components/pet';
import { repos } from '@/database';
import type { TableName } from '@/database/repositories';
import { formatTime } from '@/domain/dates';
import { RecordExtras } from '@/features/records/RecordExtras';
import { RecordForm } from '@/features/records/RecordForm';
import { fromForm, isRecordKind, SPECS, toForm, type FormValues } from '@/features/records/specs';
import { useData } from '@/hooks/useData';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { mutate } from '@/services/mutations';
import { usePreferences } from '@/store/preferences';

/**
 * Generic create/edit screen for every record kind (health visit, vaccination, treatment…).
 * Data-entry screen: no ads are ever shown here.
 */
export default function RecordScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ kind: string; id?: string; petId?: string }>();
  const kind = isRecordKind(params.kind) ? params.kind : null;
  const spec = kind ? SPECS[kind] : null;
  const { weightUnit, currency } = usePreferences();
  const { data: pets } = useData((r) => r.pets.listActive());
  const editing = !!params.id;
  // New records start from the spec defaults; existing ones are loaded below.
  const [draft, setValues] = useState<FormValues | null>(() => {
    if (!spec || editing) return null;
    const now = clock.now();
    return spec.defaults({ petId: params.petId ?? null, today: clock.today(), nowTime: formatTime(now.getHours(), now.getMinutes()), weightUnit, currency });
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [missing, setMissing] = useState(false);

  // Single-pet households: preselect the only pet (derived, not stored).
  const needsPet = !editing && !!spec?.fields.find((f) => f.name === 'petId')?.required;
  const values = draft && needsPet && !draft.petId && pets?.length === 1 ? { ...draft, petId: pets[0]!.id } : draft;

  useEffect(() => {
    if (!spec || !params.id) return;
    const tbl = repos().tables[spec.table as TableName] as unknown as { get(id: string): Promise<Record<string, unknown> | null> };
    tbl
      .get(params.id)
      .then((e) => (e ? setValues(toForm(spec, e, weightUnit)) : setMissing(true)))
      .catch((e) => {
        recordError(e, 'record_load');
        setMissing(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, kind]);

  if (!spec || missing) {
    return (
      <Screen>
        <Stack.Screen options={{ title: t('common.notFound') }} />
        <Text>{t('common.notFoundBody')}</Text>
        <Button label={t('common.back')} onPress={() => router.back()} variant="secondary" />
      </Screen>
    );
  }

  const save = async () => {
    if (!values) return;
    const errs: Record<string, string> = { ...(spec.validate?.(values) ?? {}) };
    for (const f of spec.fields) {
      if (f.type === 'pet' && f.required && !values[f.name]) errs[f.name] = 'errors.pickPet';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const data = fromForm(spec, values, weightUnit, currency);
      await mutate(t, async () => {
        const r = repos();
        if (editing) await r.update(spec.table, params.id!, data as never);
        else await r.create(spec.table, { ...(spec.fixed?.({ petId: null, today: clock.today(), nowTime: '', weightUnit, currency }) ?? {}), ...data } as never);
      });
      if (!editing) track('record_added', { kind: spec.kind });
      router.back();
    } catch (e) {
      recordError(e, 'record_save');
      Alert.alert(t('errors.saveFailedTitle'), t('errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert(t('common.deleteTitle'), t('common.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await mutate(t, () => repos().remove(spec.table, params.id!));
          router.back();
        },
      },
    ]);

  const medical = spec.kind === 'health' || spec.kind === 'treatment' || spec.kind === 'vaccination';

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={saving} disabled={!values} testID="save-record" />}>
      <Stack.Screen options={{ title: t(editing ? spec.title : spec.newTitle) }} />
      {medical ? <MedicalDisclaimer compact /> : null}
      {values ? <RecordForm spec={spec} values={values} errors={errors} pets={pets ?? []} onChange={(p) => setValues({ ...values, ...p })} /> : null}
      {editing && values ? <RecordExtras kind={spec.kind} id={params.id!} petId={(values.petId as string | null) ?? null} /> : null}
      {editing ? (
        <UIStack gap={2}>
          <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={remove} testID="delete-record" />
        </UIStack>
      ) : null}
    </Screen>
  );
}
