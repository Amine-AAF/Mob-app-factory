import { Button, Card, Icon, IconButton, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ChoiceChips } from '@/components/Choice';
import { DateField } from '@/components/DateField';
import { TextField } from '@/components/TextField';
import { CURRENCY_CODES, type CurrencyCode } from '@/constants/currencies';
import { repos } from '@/database';
import { CurrencyValidationError } from '@/database/repositories/currency';
import { formatRate, pickRate, type RateQuote } from '@/features/currency/rates';
import { clearConversionHistory, convertAndRecord, deleteRate, saveRate } from '@/features/expenses/actions';
import { useAsync } from '@/hooks/useAsync';
import { currentLanguage, fmt } from '@/i18n';
import { recordError } from '@/services/analytics';
import { usePreferences } from '@/store/preferences';
import { clock } from '@/utils/clock';
import { convertMinor, parseAmount, parseRate } from '@/utils/money';

/**
 * Offline currency converter. Rates are typed by the user (manual mode) and stored with
 * their date and source; no live rate is ever displayed without an external provider.
 */
export default function ConverterScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const defaultCurrency = usePreferences((s) => s.defaultCurrency);
  const { data } = useAsync(async () => {
    const r = repos();
    const [rates, history, trip] = await Promise.all([r.currency.listRates(tripId ?? null), r.currency.history(), tripId ? r.trips.get(tripId) : Promise.resolve(null)]);
    return { rates, history, trip };
  }, [tripId]);

  const [from, setFrom] = useState<CurrencyCode>('EUR');
  const [to, setTo] = useState<CurrencyCode>(defaultCurrency === 'EUR' ? 'USD' : defaultCurrency);
  const [amount, setAmount] = useState('');
  const [rateText, setRateText] = useState('');
  const [rateDate, setRateDate] = useState<string>(clock.today());
  const [forTrip, setForTrip] = useState(!!tripId);
  const [error, setError] = useState<string | null>(null);

  const saved: RateQuote | null = data ? pickRate(data.rates, from, to, tripId ?? null) : null;
  const typedRate = rateText.trim() ? parseRate(rateText) : null;
  const quote: RateQuote | null = from === to ? null : typedRate ? { base: from, quote: to, rate: typedRate, rateDate, source: 'manual', inverted: false } : saved;
  const amountMinor = amount.trim() ? parseAmount(amount, from) : null;
  const result = quote && amountMinor !== null ? convertMinor(amountMinor, from, to, quote.rate) : null;
  const lang = currentLanguage();

  const fail = (e: unknown) => {
    if (e instanceof CurrencyValidationError) setError(t(`converter.errors.${e.code}`));
    else {
      recordError(e, 'converter');
      setError(t('tripForm.errors.generic'));
    }
  };

  const save = () => {
    setError(null);
    if (!typedRate) return setError(t('converter.errors.invalid_rate'));
    saveRate({ base: from, quote: to, rate: typedRate, rateDate, tripId: forTrip ? (tripId ?? null) : null })
      .then(() => {
        setRateText('');
        Alert.alert(t('converter.rateSaved'));
      })
      .catch(fail);
  };

  const record = () => {
    setError(null);
    if (amountMinor === null) return setError(t('converter.errors.invalid_amount'));
    if (!quote) return setError(t('converter.errors.no_rate'));
    convertAndRecord(amountMinor, quote).catch(fail);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
    setRateText('');
  };

  return (
    <Screen edges={[]} testID="converter-screen">
      <RouterStack.Screen options={{ headerShown: true, title: t('converter.title') }} />
      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
          <Text variant="caption" tone="muted" style={{ flex: 1 }}>
            {t('converter.manualNotice')}
          </Text>
        </Row>
      </Card>

      <ChoiceChips label={t('converter.from')} options={CURRENCY_CODES} value={from} onChange={(c) => {
        setFrom(c);
        setRateText('');
      }} labelOf={(c) => c} testID="converter-from" />
      <Row style={{ justifyContent: 'center' }}>
        <IconButton icon="swap-vertical" label={t('converter.swap')} onPress={swap} />
      </Row>
      <ChoiceChips label={t('converter.to')} options={CURRENCY_CODES} value={to} onChange={(c) => {
        setTo(c);
        setRateText('');
      }} labelOf={(c) => c} testID="converter-to" />
      <TextField label={t('converter.amount', { currency: from })} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} testID="converter-amount" />

      <Card>
        <TextField
          label={t('converter.rateLabel', { from, to })}
          keyboardType="decimal-pad"
          value={rateText}
          onChangeText={setRateText}
          placeholder={saved ? formatRate(saved.rate, lang) : undefined}
          testID="converter-rate"
        />
        {rateText.trim() ? (
          <>
            <DateField label={t('converter.rateDate')} value={rateDate} onChange={(d) => d && setRateDate(d)} />
            {tripId && data?.trip ? (
              <ChoiceChips
                options={['trip', 'global'] as const}
                value={forTrip ? 'trip' : 'global'}
                onChange={(v) => setForTrip(v === 'trip')}
                labelOf={(v) => (v === 'trip' ? t('converter.forTrip', { name: data.trip!.name }) : t('converter.forAll'))}
              />
            ) : null}
            <Button label={t('converter.saveRate')} variant="secondary" icon="bookmark-outline" onPress={save} testID="converter-save-rate" />
          </>
        ) : null}
        {from === to ? (
          <Text variant="caption" tone="subtle">
            {t('converter.sameCurrency')}
          </Text>
        ) : quote ? (
          <Text variant="caption" tone="muted" testID="converter-rate-info">
            {t('converter.rateInfo', {
              from,
              to,
              rate: formatRate(quote.rate, lang),
              date: quote.rateDate ? fmt.date(quote.rateDate) : '—',
              source: t(`converter.sources.${quote.source === 'manual' ? 'manual' : 'other'}`),
            })}
            {quote.inverted ? ` ${t('converter.inverted')}` : ''}
          </Text>
        ) : (
          <Text variant="caption" tone="warning">
            {t('converter.noRate', { from, to })}
          </Text>
        )}
      </Card>

      <Card tone="primary" testID="converter-result">
        <Text variant="label">{t('converter.result')}</Text>
        <Text variant="title">{result !== null ? fmt.money(result, to) : '—'}</Text>
        <Text variant="caption" tone="muted">
          {t('converter.bankWarning')}
        </Text>
      </Card>
      {error ? <Text tone="danger">{error}</Text> : null}
      <Button label={t('converter.addToHistory')} icon="time-outline" onPress={record} disabled={result === null} testID="converter-record" />

      {data?.rates.length ? (
        <>
          <SectionHeader title={t('converter.savedRates')} />
          <Stack gap={2}>
            {data.rates.map((r) => (
              <Row key={r.id} gap={2}>
                <Text variant="bodySmall" style={{ flex: 1 }}>
                  {`1 ${r.base} = ${formatRate(r.rate, lang)} ${r.quote} · ${fmt.date(r.rateDate)}${r.tripId ? ` · ${t('converter.tripRate')}` : ''}`}
                </Text>
                <IconButton icon="trash-outline" label={t('common.delete')} onPress={() => deleteRate(r.id).catch(fail)} size={18} />
              </Row>
            ))}
          </Stack>
        </>
      ) : null}

      {data?.history.length ? (
        <>
          <SectionHeader title={t('converter.history')} action={t('converter.clearHistory')} onAction={() => clearConversionHistory().catch(fail)} />
          <Stack gap={1}>
            {data.history.map((h) => (
              <Text key={h.id} variant="caption" tone="muted">
                {`${fmt.money(h.amountMinor, h.base)} → ${fmt.money(h.resultMinor, h.quote)} · ${t('converter.historyRate', { rate: formatRate(h.rate, lang), date: h.rateDate ? fmt.date(h.rateDate) : '—' })}`}
              </Text>
            ))}
          </Stack>
        </>
      ) : null}
    </Screen>
  );
}
