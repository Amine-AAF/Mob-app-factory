import { Button, Card, IconButton, Row, Screen, Text } from '@factory/design-system';
import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDay } from '@/components/finance';
import { CurrencySelector, FormField } from '@/components/inputs';
import { ValidationError } from '@/features/transactions/validation';
import { mutate, useData } from '@/hooks';
import { recordError } from '@/services/analytics';
import { reloadSession } from '@/services/boot';
import { useMainCurrency } from '@/store/session';

/**
 * Main currency + MANUAL exchange rates. SpendWise never fetches rates and never converts
 * without a rate the user typed; each rate shows its source ("manual") and last update date.
 */
export default function CurrencyScreen() {
  const { t } = useTranslation();
  const main = useMainCurrency();
  const { data } = useData(async (r) => ({ rates: await r.rates.list(), accounts: await r.accounts.list({ includeArchived: true }) }), []);
  const [from, setFrom] = useState(main === 'EUR' ? 'USD' : 'EUR');
  const [rate, setRate] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function setMain(c: string) {
    try {
      await mutate((r) => r.settings.set('mainCurrency', c));
      await reloadSession();
    } catch (e) {
      recordError(e, 'currency_main');
    }
  }

  async function addRate() {
    setError(null);
    if (from === main) return setError(t('errors.currency'));
    try {
      await mutate((r) => r.rates.set(from, rate));
      setRate('');
    } catch (e) {
      setError(e instanceof ValidationError ? t(`errors.${e.code}`) : t('common.error'));
    }
  }

  const otherCurrencies = [...new Set((data?.accounts ?? []).map((a) => a.currency))].filter((c) => c !== main);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('currency.title') }} />
      <Card>
        <Text variant="subheading">{t('currency.main')}</Text>
        <Text variant="caption" tone="muted">
          {t('currency.mainDesc')}
        </Text>
        <CurrencySelector label={t('common.currency')} value={main} onChange={setMain} testID="main-currency" />
      </Card>

      <Text variant="heading">{t('currency.rates')}</Text>
      <Text variant="bodySmall" tone="muted">
        {t('currency.ratesDesc')}
      </Text>
      {otherCurrencies.length ? (
        <Text variant="caption" tone="warning">
          {otherCurrencies.filter((c) => !(data?.rates ?? []).some((r) => r.currency === c)).join(', ')}
        </Text>
      ) : null}
      {(data?.rates ?? []).length === 0 ? <Text tone="muted">{t('currency.noRates')}</Text> : null}
      {(data?.rates ?? []).map((r) => (
        <Card key={r.currency}>
          <Row gap={3}>
            <View style={{ flex: 1 }}>
              <Text variant="subheading">
                1 {r.currency} = {r.rate} {main}
              </Text>
              <Text variant="caption" tone="muted">
                {t('currency.rateSaved', { date: formatDay(r.updatedAt.slice(0, 10)) })}
              </Text>
            </View>
            <IconButton icon="trash-outline" tone="danger" label={t('common.delete')} onPress={() => mutate((x) => x.rates.remove(r.currency))} />
          </Row>
        </Card>
      ))}
      <Card tone="alt">
        <Text variant="subheading">{t('currency.addRate')}</Text>
        <CurrencySelector label={t('common.currency')} value={from} onChange={setFrom} />
        <FormField label={t('currency.rateLabel', { from, to: main })} value={rate} onChangeText={setRate} keyboardType="decimal-pad" placeholder="1.0" error={error} testID="rate-input" />
        <Button label={t('common.save')} size="md" onPress={addRate} testID="rate-save" />
      </Card>
    </Screen>
  );
}
