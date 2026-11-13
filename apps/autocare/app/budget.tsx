import { Button } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CurrencyPicker } from '@/components/CurrencyPicker';
import { FormScreen, InfoNote, NumberField, readNumber } from '@/components/ui';
import { repos } from '@/database';
import { toMinor } from '@/features/money/money';
import { useAsync } from '@/hooks';
import { afterWrite } from '@/services/boot';
import { clock } from '@/services/clock';
import { feedback } from '@/services/feedback';
import { usePreferences } from '@/store/preferences';

/** Monthly budget for all vehicles, in one currency (other currencies are reported apart). */
export default function BudgetScreen() {
  const { t } = useTranslation();
  const { data } = useAsync(() => repos().budgets.get(null), []);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(usePreferences.getState().currency);
  const [submitted, setSubmitted] = useState(false);

  const [loaded, setLoaded] = useState(false);
  if (data && !loaded) {
    setLoaded(true);
    setAmount(String(data.monthlyMinor / 100));
    setCurrency(data.currency);
  }

  const n = readNumber(amount);
  const error = n === null || !(n > 0) ? t('common.invalidNumber') : null;

  const save = async () => {
    setSubmitted(true);
    if (error || n === null) return;
    await repos().budgets.set({ vehicleId: null, monthlyMinor: toMinor(n), currency }, null, clock.now());
    afterWrite();
    feedback.success();
    router.back();
  };

  return (
    <>
      <RouterStack.Screen options={{ title: t('budget.title') }} />
      <FormScreen
        onSave={() => void save()}
        extra={
          data ? (
            <Button
              label={t('budget.remove')}
              variant="danger"
              size="md"
              icon="trash-outline"
              onPress={async () => {
                await repos().budgets.set(null, null, clock.now());
                afterWrite();
                router.back();
              }}
            />
          ) : null
        }
      >
        <InfoNote text={t('budget.scopeAll')} />
        <NumberField label={t('budget.amount')} value={amount} onChange={setAmount} suffix={currency} error={submitted ? error : null} />
        <CurrencyPicker value={currency} onChange={setCurrency} />
        <InfoNote text={t('expenses.multiCurrency')} />
      </FormScreen>
    </>
  );
}
