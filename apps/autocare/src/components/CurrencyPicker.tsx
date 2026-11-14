import { Stack, Text } from '@factory/design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isCurrencyCode } from '@/features/money/money';
import { usePreferences } from '@/store/preferences';
import type { CurrencyCode } from '@/types';

import { ChoiceChips, Field } from './ui';

/** Currency per entry: the default + the vehicle's + recently relevant codes, or any ISO code. */
export function CurrencyPicker({ value, onChange, extra = [] }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void; extra?: CurrencyCode[] }) {
  const { t } = useTranslation();
  const preferred = usePreferences((s) => s.currency);
  const options = [...new Set([value, preferred, ...extra, 'USD', 'EUR'])].filter(isCurrencyCode);
  const [custom, setCustom] = useState('');
  return (
    <Stack gap={2}>
      <ChoiceChips label={t('common.currency')} value={value} options={options.map((c) => ({ value: c, label: c }))} onChange={onChange} />
      <Field
        label={t('settings.otherCurrency')}
        value={custom}
        autoCapitalize="characters"
        maxLength={3}
        placeholder="MAD, CAD, MXN…"
        onChangeText={(s) => {
          const code = s.toUpperCase().replace(/[^A-Z]/g, '');
          setCustom(code);
          if (isCurrencyCode(code)) onChange(code);
        }}
      />
      {value !== preferred ? (
        <Text variant="caption" tone="subtle">
          {t('expenses.multiCurrency')}
        </Text>
      ) : null}
    </Stack>
  );
}
