import { Button, Screen, Stack, Text } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChoiceChips } from '@/components/Choice';
import { CURRENCY_CODES } from '@/constants/currencies';
import { usePreferences } from '@/store/preferences';

/** Step 3: main currency (optional — USD is preselected). */
export default function OnboardingCurrency() {
  const { t } = useTranslation();
  const currency = usePreferences((s) => s.defaultCurrency);
  const setPrefs = usePreferences((s) => s.set);
  return (
    <Screen testID="onboarding-currency" footer={<Button label={t('common.next')} size="lg" onPress={() => router.push('/onboarding/first-trip')} testID="onboarding-currency-next" />}>
      <Stack gap={3}>
        <Text variant="title" accessibilityRole="header">
          {t('onboarding.currencyTitle')}
        </Text>
        <Text tone="muted">{t('onboarding.currencyBody')}</Text>
        <ChoiceChips options={CURRENCY_CODES} value={currency} labelOf={(c) => c} onChange={(c) => setPrefs({ defaultCurrency: c })} testID="onboarding-currency-choice" />
      </Stack>
    </Screen>
  );
}
