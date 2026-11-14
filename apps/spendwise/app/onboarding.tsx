import { Button, Card, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AmountInput, ChoiceChips, CurrencySelector, FormField } from '@/components/inputs';
import { ACCOUNT_ICONS, PALETTE } from '@/constants';
import { repos } from '@/database';
import { ValidationError } from '@/features/transactions/validation';
import { recordError, track } from '@/services/analytics';
import { reloadSession, startPostOnboardingServices } from '@/services/boot';
import { clock } from '@/services/clock';
import { usePreferences } from '@/store/preferences';
import { ACCOUNT_TYPES, type AccountType } from '@/types';
import { monthOf } from '@/utils/dates';
import { parseAmount } from '@/utils/money';

/** Suggests a main currency from the device region (user can change it). */
function guessCurrency(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getLocales } = require('expo-localization') as typeof import('expo-localization');
    const code = getLocales()[0]?.currencyCode;
    if (code) return code;
  } catch {
    // ignore: falls back to USD
  }
  return 'USD';
}

const TOTAL = 4;

/**
 * 1. Welcome · 2. Main currency · 3. Optional first account (+ optional balance) · 4. Optional budget.
 * Nothing is created unless the user fills it in: no sample transactions, no bank connection.
 */
export default function Onboarding() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState(guessCurrency);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState({ account: false, budget: false });

  async function saveCurrency() {
    try {
      await repos().settings.set('mainCurrency', currency);
      setStep(3);
    } catch (e) {
      recordError(e, 'onboarding_currency');
      setError(t('common.error'));
    }
  }

  async function saveAccount(skip: boolean) {
    setError(null);
    if (skip) return setStep(4);
    const parsed = balance.trim() ? parseAmount(balance, currency, { allowNegative: true }) : ({ ok: true, minor: 0 } as const);
    if (!parsed.ok) return setError(t(`errors.${parsed.error}`));
    setBusy(true);
    try {
      await repos().accounts.create({
        name: accountName.trim() || t('onboarding.accountNameDefault'),
        type: accountType,
        currency,
        initialBalance: parsed.minor,
        color: PALETTE[0],
        icon: ACCOUNT_ICONS[accountType],
      });
      setCreated((c) => ({ ...c, account: true }));
      setStep(4);
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'onboarding_account');
        setError(t('common.error'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function finish(skipBudget: boolean) {
    setError(null);
    let budgetCreated = created.budget;
    if (!skipBudget && budget.trim()) {
      const parsed = parseAmount(budget, currency);
      if (!parsed.ok || parsed.minor <= 0) return setError(t(parsed.ok ? 'errors.amount' : `errors.${parsed.error}`));
      try {
        await repos().budgets.save(monthOf(clock.today()), { currency, totalLimit: parsed.minor, limits: [] });
        budgetCreated = true;
      } catch (e) {
        recordError(e, 'onboarding_budget');
      }
    }
    usePreferences.getState().set({ onboardingCompleted: true });
    track('onboarding_completed', { created_account: created.account, created_budget: budgetCreated });
    await reloadSession();
    startPostOnboardingServices();
    router.replace('/(tabs)');
  }

  const header = (
    <Text variant="caption" tone="muted">
      {t('onboarding.step', { current: step, total: TOTAL })}
    </Text>
  );

  if (step === 1)
    return (
      <Screen edges={['top', 'bottom']} footer={<Button label={t('onboarding.start')} onPress={() => setStep(2)} testID="onboarding-start" />}>
        <View style={{ alignItems: 'center', marginTop: theme.spacing(10), gap: theme.spacing(4) }}>
          <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wallet" size={44} color={theme.colors.onPrimary} />
          </View>
          <Text variant="display" center>
            {t('onboarding.welcomeTitle')}
          </Text>
          <Text variant="subheading" tone="primary" center>
            {t('app.tagline')}
          </Text>
          <Text tone="muted" center>
            {t('onboarding.welcomeBody')}
          </Text>
        </View>
        <Card>
          {(['point1', 'point2', 'point3'] as const).map((p, i) => (
            <Row key={p} gap={3}>
              <Icon name={(['phone-portrait-outline', 'lock-closed-outline', 'cloud-offline-outline'] as const)[i]!} size={20} color={theme.colors.primary} />
              <Text>{t(`onboarding.${p}`)}</Text>
            </Row>
          ))}
        </Card>
      </Screen>
    );

  if (step === 2)
    return (
      <Screen edges={['top', 'bottom']} footer={<Button label={t('common.continue')} onPress={saveCurrency} testID="onboarding-currency-next" />}>
        {header}
        <Text variant="title">{t('onboarding.currencyTitle')}</Text>
        <Text tone="muted">{t('onboarding.currencyBody')}</Text>
        <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} testID="onboarding-currency" />
        {error ? <Text tone="danger">{error}</Text> : null}
      </Screen>
    );

  if (step === 3)
    return (
      <Screen
        edges={['top', 'bottom']}
        footer={
          <Stack gap={2}>
            <Button label={t('common.continue')} onPress={() => saveAccount(false)} loading={busy} testID="onboarding-account-next" />
            <Button label={t('common.skip')} variant="ghost" onPress={() => saveAccount(true)} testID="onboarding-account-skip" />
          </Stack>
        }
      >
        {header}
        <Text variant="title">{t('onboarding.accountTitle')}</Text>
        <Text tone="muted">{t('onboarding.accountBody')}</Text>
        <FormField label={t('onboarding.accountName')} value={accountName} onChangeText={setAccountName} placeholder={t('onboarding.accountNameDefault')} maxLength={60} />
        <ChoiceChips label={t('accounts.type')} options={ACCOUNT_TYPES.map((k) => ({ value: k, label: t(`accounts.types.${k}`) }))} value={accountType} onChange={setAccountType} />
        <AmountInput label={`${t('onboarding.initialBalance')} · ${t('common.optional')}`} value={balance} onChange={setBalance} currency={currency} error={error} testID="onboarding-balance" />
        <Text variant="caption" tone="muted">
          {t('onboarding.initialBalanceHint')}
        </Text>
      </Screen>
    );

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Stack gap={2}>
          <Button label={t('onboarding.finish')} onPress={() => finish(false)} testID="onboarding-finish" />
          <Button label={t('common.skip')} variant="ghost" onPress={() => finish(true)} testID="onboarding-budget-skip" />
        </Stack>
      }
    >
      {header}
      <Text variant="title">{t('onboarding.budgetTitle')}</Text>
      <Text tone="muted">{t('onboarding.budgetBody')}</Text>
      <AmountInput label={`${t('onboarding.budgetAmount')} · ${t('common.optional')}`} value={budget} onChange={setBudget} currency={currency} error={error} testID="onboarding-budget" />
    </Screen>
  );
}
