import { Stack } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

import { MIN_MASTER_PASSWORD_LENGTH } from '@/vault/errors';
import type { useMasterPasswordForm } from '@/hooks/useMasterPasswordForm';

import { SecretInput } from './inputs';
import { StrengthMeter } from './vault';

export function MasterPasswordFields({ form, labels }: { form: ReturnType<typeof useMasterPasswordForm>; labels?: { password?: string; confirm?: string } }) {
  const { t } = useTranslation();
  const hint = form.strength.hints[0];
  return (
    <Stack gap={4}>
      <SecretInput
        label={labels?.password ?? t('create.password')}
        value={form.password}
        onChangeText={form.setPassword}
        error={form.tooShort ? t('create.tooShort', { count: MIN_MASTER_PASSWORD_LENGTH }) : null}
        hint={t('create.passwordHint')}
        testID="master-password"
      />
      {form.password ? (
        <StrengthMeter score={form.strength.score} label={t(`strength.score.${form.strength.score}`)} detail={hint ? t(`strength.hints.${hint}`) : undefined} />
      ) : null}
      <SecretInput
        label={labels?.confirm ?? t('create.confirm')}
        value={form.confirm}
        onChangeText={form.setConfirm}
        error={form.mismatch ? t('create.mismatch') : null}
        testID="master-confirm"
      />
    </Stack>
  );
}
