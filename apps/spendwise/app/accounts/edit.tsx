import { Button, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { AmountInput, ChoiceChips, ColorPicker, CurrencySelector, FormField, IconPicker } from '@/components/inputs';
import { ACCOUNT_ICONS, CATEGORY_ICONS, PALETTE } from '@/constants';
import { ValidationError } from '@/features/transactions/validation';
import { mutate, useData } from '@/hooks';
import { recordError } from '@/services/analytics';
import { useMainCurrency } from '@/store/session';
import { ACCOUNT_TYPES, type Account, type AccountType } from '@/types';
import { minorToInput, parseAmount } from '@/utils/money';

const ICONS = [...new Set([...Object.values(ACCOUNT_ICONS), 'briefcase-outline', 'home-outline', 'gift-outline', 'globe-outline', ...CATEGORY_ICONS.slice(0, 6)])];

export default function AccountEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData(async (r) => (id ? { account: await r.accounts.get(id), locked: await r.accounts.hasHistory(id) } : { account: null, locked: false }), [id]);
  if (!data) return <Screen edges={[]}>{null}</Screen>;
  return <AccountForm key={id ?? 'new'} id={id ?? null} account={data.account} locked={data.locked} />;
}

function AccountForm({ id, account: a, locked }: { id: string | null; account: Account | null; locked: boolean }) {
  const { t } = useTranslation();
  const main = useMainCurrency();
  const [name, setName] = useState(a?.name ?? '');
  const [type, setType] = useState<AccountType>(a?.type ?? 'bank');
  const [currency, setCurrency] = useState(a?.currency ?? main);
  const [balance, setBalance] = useState(() => (a?.initialBalance ? minorToInput(a.initialBalance, a.currency) : ''));
  const [color, setColor] = useState<string>(a?.color ?? PALETTE[0]);
  const [icon, setIcon] = useState(a?.icon ?? ACCOUNT_ICONS.bank);
  const [iconTouched, setIconTouched] = useState(!!a);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const parsed = balance.trim() ? parseAmount(balance, currency, { allowNegative: true }) : ({ ok: true, minor: 0 } as const);
    if (!parsed.ok) return setError(t(`errors.${parsed.error}`));
    const input = { name, type, currency, initialBalance: parsed.minor, color, icon };
    try {
      if (id) await mutate((r) => r.accounts.update(id, input));
      else await mutate((r) => r.accounts.create(input));
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'account_save');
        setError(t('common.error'));
      }
    }
  }

  function remove() {
    if (!id) return;
    if (locked) {
      Alert.alert(t('accounts.deleteTitle'), t('accounts.hasHistory'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.archive'), onPress: () => mutate((r) => r.accounts.setArchived(id, true)).then(() => router.back()) },
      ]);
      return;
    }
    Alert.alert(t('accounts.deleteTitle'), t('common.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => mutate((r) => r.accounts.remove(id)).then(() => router.dismissTo('/accounts')) },
    ]);
  }

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="account-save" />}>
      <RouterStack.Screen options={{ title: id ? t('accounts.edit') : t('accounts.new') }} />
      <FormField label={t('common.name')} value={name} onChangeText={setName} maxLength={60} error={error} testID="account-name" />
      <ChoiceChips
        label={t('accounts.type')}
        options={ACCOUNT_TYPES.map((k) => ({ value: k, label: t(`accounts.types.${k}`) }))}
        value={type}
        onChange={(k) => {
          setType(k);
          if (!iconTouched) setIcon(ACCOUNT_ICONS[k]);
        }}
      />
      {locked ? (
        <Text variant="bodySmall" tone="muted">
          {t('common.currency')}: {currency} — {t('accounts.currencyLocked')}
        </Text>
      ) : (
        <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} />
      )}
      <AmountInput label={t('accounts.initialBalance')} value={balance} onChange={setBalance} currency={currency} />
      <Text variant="caption" tone="muted">
        {t('accounts.initialBalanceHint')}
      </Text>
      <ColorPicker label={t('common.color')} colors={PALETTE} value={color} onChange={setColor} />
      <IconPicker
        label={t('common.icon')}
        icons={ICONS}
        value={icon}
        color={color}
        onChange={(i) => {
          setIcon(i);
          setIconTouched(true);
        }}
      />
      {id ? (
        <>
          {a?.archived ? <Button label={t('common.unarchive')} variant="secondary" size="md" onPress={() => mutate((r) => r.accounts.setArchived(id, false)).then(() => router.back())} /> : null}
          <Button label={locked ? t('common.archive') : t('common.delete')} variant="danger" size="md" icon="archive-outline" onPress={remove} testID="account-delete" />
        </>
      ) : null}
    </Screen>
  );
}
