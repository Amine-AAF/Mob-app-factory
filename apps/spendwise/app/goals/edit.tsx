import { Button, Chip, Row, Screen, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AmountInput, ColorPicker, CurrencySelector, DateField, FieldLabel, FormField, IconPicker } from '@/components/inputs';
import { GOAL_ICONS, GOAL_PRESETS, PALETTE } from '@/constants';
import { mutate, useData } from '@/hooks';
import { ValidationError } from '@/features/transactions/validation';
import { recordError, track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useMainCurrency } from '@/store/session';
import type { SavingsGoal } from '@/types';
import type { DayKey } from '@/utils/dates';
import { minorToInput, parseAmount } from '@/utils/money';

const PRESET_ICONS: Record<(typeof GOAL_PRESETS)[number], string> = {
  emergency: 'shield-outline',
  car: 'car-outline',
  vacation: 'airplane-outline',
  home: 'home-outline',
  education: 'school-outline',
  personal: 'star-outline',
};

export default function GoalEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data } = useData(async (r) => {
    const goal = id ? await r.goals.get(id) : null;
    const contributions = id ? await r.goals.contributions(id) : [];
    return { goal, hasContributions: contributions.length > 0 };
  }, [id]);
  if (!data) return null;
  return <GoalForm key={id ?? 'new'} id={id} goal={data.goal} hasContributions={data.hasContributions} />;
}

function GoalForm({ id, goal: g, hasContributions }: { id: string | undefined; goal: SavingsGoal | null; hasContributions: boolean }) {
  const { t } = useTranslation();
  const mainCurrency = useMainCurrency();
  const today = clock.today();

  const [name, setName] = useState(() => g?.name ?? '');
  const [target, setTarget] = useState(() => (g ? minorToInput(g.target, g.currency) : ''));
  const [currency, setCurrency] = useState(() => g?.currency ?? mainCurrency);
  const [saved, setSaved] = useState('');
  const [targetDate, setTargetDate] = useState<DayKey | null>(() => g?.targetDate ?? null);
  const [description, setDescription] = useState(() => g?.description ?? '');
  const [color, setColor] = useState<string>(() => g?.color ?? PALETTE[0]);
  const [icon, setIcon] = useState<string>(() => g?.icon ?? GOAL_ICONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const currencyLocked = !!id && hasContributions;

  const save = async () => {
    setError(null);
    const tp = parseAmount(target, currency);
    if (!tp.ok) return setError(t(`errors.${tp.error}`));
    if (tp.minor <= 0) return setError(t('errors.amount'));
    let initial = 0;
    if (!id && saved.trim()) {
      const sp = parseAmount(saved, currency);
      if (!sp.ok) return setError(t(`errors.${sp.error}`));
      initial = sp.minor;
    }
    const input = { name, target: tp.minor, currency, targetDate, description, color, icon };
    setBusy(true);
    try {
      if (id) await mutate((r) => r.goals.update(id, input));
      else {
        await mutate((r) => r.goals.create(input, initial, today));
        track('savings_goal_created', {});
      }
      router.back();
    } catch (e) {
      if (e instanceof ValidationError) setError(t(`errors.${e.code}`));
      else {
        recordError(e, 'goal_save');
        setError(t('common.error'));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={busy} testID="goal-save" />}>
      <RouterStack.Screen options={{ title: id ? t('goals.edit') : t('goals.new') }} />
      {!id ? (
        <>
          <FieldLabel>{t('goals.presetsLabel')}</FieldLabel>
          <Row gap={2} wrap>
            {GOAL_PRESETS.map((p) => (
              <Chip
                key={p}
                label={t(`goals.presets.${p}`)}
                icon={PRESET_ICONS[p] as never}
                selected={name === t(`goals.presets.${p}`)}
                onPress={() => {
                  setName(t(`goals.presets.${p}`));
                  setIcon(PRESET_ICONS[p]);
                }}
              />
            ))}
          </Row>
        </>
      ) : null}
      <FormField label={t('common.name')} value={name} onChangeText={setName} maxLength={60} testID="goal-name" />
      <AmountInput label={t('goals.target')} value={target} onChange={setTarget} currency={currency} testID="goal-target" />
      {currencyLocked ? (
        <Text variant="caption" tone="muted">
          {t('common.currency')}: {currency} — {t('errors.currency_locked')}
        </Text>
      ) : (
        <CurrencySelector label={t('common.currency')} value={currency} onChange={setCurrency} />
      )}
      {!id ? (
        <>
          <AmountInput label={t('goals.alreadySaved')} value={saved} onChange={setSaved} currency={currency} testID="goal-saved" />
          <Text variant="caption" tone="muted">
            {t('goals.alreadySavedHint')}
          </Text>
        </>
      ) : null}
      <DateField label={t('goals.targetDate')} value={targetDate} onChange={setTargetDate} today={today} allowClear />
      <FormField label={t('common.description')} value={description} onChangeText={setDescription} multiline maxLength={500} />
      <ColorPicker label={t('common.color')} colors={PALETTE} value={color} onChange={setColor} />
      <IconPicker label={t('common.icon')} icons={GOAL_ICONS} value={icon} onChange={setIcon} color={color} />
      {error ? (
        <Text tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}
