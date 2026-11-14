import { Row, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { DateField, Field, FormScreen, InfoNote, NumberField, readNumber, VehicleChooser } from '@/components/ui';
import { repos } from '@/database';
import { checkLabel, customizationKey, effectiveItems, templateById, type TemplateCustomization } from '@/features/templates/data';
import { distanceToKm, kmToDistance } from '@/features/units/units';
import { useAsync, useFormat, useToday } from '@/hooks';
import { pickVehicleId } from '@/hooks/data';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';
import type { InspectionResult } from '@/types';
import { cleanText } from '@/utils';
import { isValidDay } from '@/utils/dates';


function ResultPicker({ value, onChange, label }: { value: InspectionResult | undefined; onChange: (v: InspectionResult) => void; label: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const opts: { v: InspectionResult; color: string; bg: string }[] = [
    { v: 'ok', color: theme.colors.success, bg: theme.colors.successSoft },
    { v: 'attention', color: theme.colors.warning, bg: theme.colors.warningSoft },
    { v: 'na', color: theme.colors.textMuted, bg: theme.colors.surfaceAlt },
  ];
  return (
    <Row gap={2} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {opts.map((o) => (
        <Pressable key={o.v} onPress={() => onChange(o.v)} accessibilityRole="radio" accessibilityState={{ selected: value === o.v }} accessibilityLabel={`${label}: ${t(`inspection.${o.v}`)}`} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: value === o.v ? o.color : theme.colors.border, backgroundColor: value === o.v ? o.bg : 'transparent' }}>
          <Text variant="caption" style={{ color: value === o.v ? o.color : theme.colors.textMuted, fontWeight: '700' }}>
            {t(`inspection.${o.v}`)}
          </Text>
        </Pressable>
      ))}
    </Row>
  );
}

export default function RunInspection() {
  const { t } = useTranslation();
  const f = useFormat();
  const today = useToday();
  const units = usePreferences((s) => s.units);
  const { templateId, vehicleId: vParam } = useLocalSearchParams<{ templateId: string; vehicleId?: string }>();
  const tpl = templateById(templateId);
  const { data } = useAsync(async () => ({ vehicles: await repos().vehicles.list(), custom: await repos().settings.get<TemplateCustomization | null>(customizationKey(templateId), null) }), [templateId]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [day, setDay] = useState(today);
  const [odometer, setOdometer] = useState('');
  const [results, setResults] = useState<Record<string, InspectionResult>>({});
  const [notes, setNotes] = useState('');

  if (data && !vehicleId) {
    const id = pickVehicleId(data.vehicles, vParam);
    if (id) {
      setVehicleId(id);
      const v = data.vehicles.find((x) => x.id === id);
      if (v) setOdometer(String(Math.round(kmToDistance(v.odometerKm, units.distance))));
    }
  }

  if (!tpl) return null;
  const items = effectiveItems(tpl, data?.custom);
  const ok = Object.values(results).filter((r) => r === 'ok').length;
  const attention = Object.values(results).filter((r) => r === 'attention').length;
  const odo = readNumber(odometer);

  const save = async () => {
    if (!vehicleId || !isValidDay(day) || (odo !== null && !(odo >= 0))) {
      feedback.warning();
      return;
    }
    await repos().inspections.save({ vehicleId, templateId: tpl.id, day, odometerKm: odo === null ? null : distanceToKm(odo, units.distance), results, notes: cleanText(notes, 2000) }, clock.now());
    afterWrite();
    feedback.success();
    router.back();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t(`templates.items.${tpl.id}.name`) }} />
      <FormScreen onSave={() => void save()} saveLabel={t('inspection.save')}>
        <InfoNote icon="alert-circle-outline" text={t('templates.disclaimer')} />
        <VehicleChooser vehicles={data?.vehicles ?? []} value={vehicleId} onChange={(v) => v && setVehicleId(v)} />
        <DateField label={t('common.date')} value={day} onChange={setDay} />
        <NumberField label={t('common.odometer')} value={odometer} onChange={setOdometer} suffix={f.distanceUnit} />
        <Text variant="bodySmall" tone="muted" accessibilityLiveRegion="polite">
          {t('inspection.summary', { ok, attention })}
        </Text>
        {items.map((item) => (
          <View key={item.key} style={{ gap: 6, paddingVertical: 6 }}>
            <Text variant="body">{checkLabel(item.key, t)}</Text>
            <ResultPicker label={checkLabel(item.key, t)} value={results[item.key]} onChange={(v) => setResults({ ...results, [item.key]: v })} />
          </View>
        ))}
        <Field label={t('common.notes')} value={notes} onChangeText={setNotes} multiline />
      </FormScreen>
    </>
  );
}
