import { Chip, Row, Stack } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { DateField, Field, SelectChips, TextField, TimeField, TimesField, ToggleRow } from '@/components/fields';
import { SPECIES_ICON } from '@/components/pet';
import type { Pet } from '@/domain/types';
import { CURRENCIES, usePreferences } from '@/store/preferences';

import type { FieldSpec, FormValues, RecordSpec } from './specs';

/** Renders a declarative record form. Pure UI: saving is done by the screen. */
export function RecordForm({
  spec,
  values,
  errors,
  pets,
  onChange,
}: {
  spec: RecordSpec;
  values: FormValues;
  errors: Record<string, string>;
  pets: readonly Pet[];
  onChange: (patch: FormValues) => void;
}) {
  return (
    <Stack gap={4}>
      {spec.fields
        .filter((f) => !f.showIf || f.showIf(values))
        .map((f) => (
          <FieldRenderer key={f.name} field={f} values={values} error={errors[f.name] ?? null} pets={pets} onChange={onChange} spec={spec} />
        ))}
    </Stack>
  );
}

function FieldRenderer({ field: f, values, error, pets, onChange, spec }: { field: FieldSpec; values: FormValues; error: string | null; pets: readonly Pet[]; onChange: (patch: FormValues) => void; spec: RecordSpec }) {
  const { t } = useTranslation();
  const weightUnit = usePreferences((s) => s.weightUnit);
  const label = t(f.label);
  const err = error ? t(error) : null;
  const set = (value: unknown) => onChange({ [f.name]: value, ...(spec.onChange?.(f.name, value, values) ?? {}) });
  const testID = `field-${f.name}`;

  switch (f.type) {
    case 'text':
    case 'multiline':
      return (
        <TextField
          label={label}
          value={String(values[f.name] ?? '')}
          onChange={set}
          multiline={f.type === 'multiline'}
          required={f.required}
          help={f.help ? t(f.help) : undefined}
          placeholder={f.placeholder ? t(f.placeholder) : undefined}
          error={err}
          testID={testID}
        />
      );
    case 'decimal':
    case 'integer':
      return (
        <TextField
          label={label}
          value={String(values[f.name] ?? '')}
          onChange={set}
          keyboardType={f.type === 'integer' ? 'number-pad' : 'decimal-pad'}
          required={f.required}
          help={f.help ? t(f.help) : undefined}
          error={err}
          testID={testID}
          maxLength={12}
        />
      );
    case 'weight':
      return <TextField label={`${label} (${weightUnit})`} value={String(values[f.name] ?? '')} onChange={set} keyboardType="decimal-pad" required={f.required} error={err} testID={testID} maxLength={8} />;
    case 'money':
      return <MoneyField label={label} amount={String(values[f.name] ?? '')} currency={(values.currency as string | null) ?? null} onChange={onChange} name={f.name} required={f.required} error={err} />;
    case 'date':
      return <DateField label={label} value={(values[f.name] as string | null) ?? null} onChange={set} required={f.required} help={f.help ? t(f.help) : undefined} error={err} testID={testID} />;
    case 'time':
      return <TimeField label={label} value={(values[f.name] as string | null) ?? null} onChange={set} required={f.required} testID={testID} />;
    case 'datetime': {
      const v = (values[f.name] as { day: string | null; time: string | null }) ?? { day: null, time: null };
      return (
        <Stack gap={2}>
          <DateField label={label} value={v.day} onChange={(day) => set({ ...v, day })} required={f.required} error={err} testID={`${testID}-day`} />
          <TimeField label={t('fields.time')} value={v.time} onChange={(time) => set({ ...v, time })} required={f.required} testID={`${testID}-time`} />
        </Stack>
      );
    }
    case 'select':
    case 'intSelect':
      return (
        <SelectChips
          label={label}
          value={(values[f.name] as string | null) ?? null}
          options={f.options ?? []}
          onChange={set}
          labelFor={(o) => t(`${f.optionPrefix}.${o}`)}
          required={f.required}
          testID={testID}
        />
      );
    case 'toggle':
      return <ToggleRow label={label} value={values[f.name] === true} onChange={set} help={f.help ? t(f.help) : undefined} testID={testID} />;
    case 'times':
      return (
        <Stack gap={1}>
          <TimesField label={label} value={(values[f.name] as string[]) ?? []} onChange={set} help={f.help ? t(f.help) : undefined} />
          {err ? <Field label="" error={err}>{null}</Field> : null}
        </Stack>
      );
    case 'pet':
      return (
        <Field label={label} required={f.required} error={err}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {f.optional ? <Chip label={t('common.noPet')} selected={!values[f.name]} onPress={() => set(null)} /> : null}
            {pets.map((p) => (
              <Chip key={p.id} label={p.name} icon={SPECIES_ICON[p.species]} selected={values[f.name] === p.id} onPress={() => set(p.id)} testID={`pick-pet-${p.id}`} />
            ))}
          </ScrollView>
        </Field>
      );
  }
}

function MoneyField({ label, amount, currency, onChange, name, required, error }: { label: string; amount: string; currency: string | null; onChange: (p: FormValues) => void; name: string; required?: boolean; error: string | null }) {
  const { t } = useTranslation();
  const fallback = usePreferences((s) => s.currency);
  const [picking, setPicking] = useState(false);
  const current = currency ?? fallback;
  return (
    <Stack gap={2}>
      <Row gap={2} style={{ alignItems: 'flex-end' }}>
        <Stack style={{ flex: 1 }}>
          <TextField label={`${label} (${current})`} value={amount} onChange={(v) => onChange({ [name]: v, currency: current })} keyboardType="decimal-pad" required={required} error={error} testID={`field-${name}`} maxLength={12} />
        </Stack>
        <Chip label={current} icon="swap-horizontal" selected={picking} onPress={() => setPicking((p) => !p)} />
      </Row>
      {picking ? (
        <Row wrap gap={2} accessibilityLabel={t('fields.currency')}>
          {[...new Set([fallback, ...CURRENCIES])].map((c) => (
            <Chip
              key={c}
              label={c}
              selected={c === current}
              onPress={() => {
                onChange({ currency: c });
                setPicking(false);
              }}
            />
          ))}
        </Row>
      ) : null}
    </Stack>
  );
}
