import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Screen, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

import { repos } from '@/database';
import { profileSchema, type UserProfile } from '@/database/repositories/profileRepository';
import { DailyTimeField, LevelField, ObjectivesField, RoleField } from '@/features/profile/ProfileFields';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { useSession } from '@/store/session';

export default function EditProfile() {
  const { t } = useTranslation();
  const theme = useTheme();
  const profile = useSession((s) => s.profile);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, formState } = useForm<UserProfile>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile ?? { englishLevel: 'intermediate', role: 'other', objectives: ['meetings'], dailyMinutes: 10, displayName: '' },
  });

  const save = handleSubmit(async (values) => {
    setSaving(true);
    try {
      useSession.getState().setProfile(await repos().profile.save(values, clock.now()));
      useSession.getState().bump();
      router.back();
    } catch (e) {
      recordError(e, 'profile_save');
      setSaving(false);
    }
  });

  return (
    <>
      <RouterStack.Screen options={{ title: t('settings.profile') }} />
      <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={saving} testID="profile-save" />}>
        <Text variant="subheading">{t('onboarding.nameLabel')}</Text>
        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <TextInput
              value={field.value ?? ''}
              onChangeText={field.onChange}
              placeholder={t('onboarding.namePlaceholder')}
              placeholderTextColor={theme.colors.textSubtle}
              maxLength={30}
              accessibilityLabel={t('onboarding.nameLabel')}
              style={{ minHeight: 50, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: 14, color: theme.colors.text, backgroundColor: theme.colors.surface, fontSize: 16 }}
            />
          )}
        />
        <Text variant="heading">{t('onboarding.stepLevel')}</Text>
        <LevelField control={control} />
        <Text variant="heading">{t('onboarding.stepRole')}</Text>
        <RoleField control={control} />
        <Text variant="heading">{t('onboarding.stepGoals')}</Text>
        <ObjectivesField control={control} errors={formState.errors} />
        <Text variant="heading">{t('onboarding.stepTime')}</Text>
        <DailyTimeField control={control} />
      </Screen>
    </>
  );
}
