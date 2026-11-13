import { Chip, OptionCard, Row, Stack, Text, type IconName } from '@factory/design-system';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DAILY_MINUTES, ENGLISH_LEVELS, OBJECTIVES, ROLES, type UserProfile } from '@/database/repositories/profileRepository';

const LEVEL_ICONS: Record<UserProfile['englishLevel'], IconName> = {
  beginner: 'leaf-outline',
  intermediate: 'trending-up-outline',
  advanced: 'rocket-outline',
};

const ROLE_ICONS: Record<UserProfile['role'], IconName> = {
  student: 'school-outline',
  java: 'cafe-outline',
  react: 'logo-react',
  fullstack: 'layers-outline',
  devops: 'cloud-outline',
  qa: 'bug-outline',
  architect: 'git-network-outline',
  other: 'laptop-outline',
};

const OBJECTIVE_ICONS: Record<UserProfile['objectives'][number], IconName> = {
  meetings: 'people-outline',
  technical: 'code-slash-outline',
  interviews: 'mic-outline',
  vocabulary: 'book-outline',
  speaking: 'chatbubbles-outline',
  writing: 'create-outline',
};

type Props = { control: Control<UserProfile>; errors?: FieldErrors<UserProfile> };

export function LevelField({ control }: Props) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name="englishLevel"
      render={({ field }) => (
        <Stack gap={3} accessibilityRole="radiogroup">
          {ENGLISH_LEVELS.map((l) => (
            <OptionCard key={l} title={t(`levels.${l}`)} subtitle={t(`levelsHint.${l}`)} icon={LEVEL_ICONS[l]} selected={field.value === l} onPress={() => field.onChange(l)} testID={`level-${l}`} />
          ))}
        </Stack>
      )}
    />
  );
}

export function RoleField({ control }: Props) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name="role"
      render={({ field }) => (
        <Stack gap={2} accessibilityRole="radiogroup">
          {ROLES.map((r) => (
            <OptionCard key={r} title={t(`roles.${r}`)} icon={ROLE_ICONS[r]} selected={field.value === r} onPress={() => field.onChange(r)} testID={`role-${r}`} />
          ))}
        </Stack>
      )}
    />
  );
}

export function ObjectivesField({ control, errors }: Props) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name="objectives"
      render={({ field }) => {
        const value = field.value ?? [];
        const toggle = (o: (typeof OBJECTIVES)[number]) => field.onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
        return (
          <Stack gap={3}>
            <Row wrap gap={2}>
              {OBJECTIVES.map((o) => (
                <Chip key={o} label={t(`objectives.${o}`)} icon={OBJECTIVE_ICONS[o]} selected={value.includes(o)} onPress={() => toggle(o)} testID={`objective-${o}`} />
              ))}
            </Row>
            {errors?.objectives ? (
              <Text variant="bodySmall" tone="danger" accessibilityLiveRegion="polite">
                {t('onboarding.pickOne')}
              </Text>
            ) : null}
          </Stack>
        );
      }}
    />
  );
}

export function DailyTimeField({ control }: Props) {
  const { t } = useTranslation();
  return (
    <Controller
      control={control}
      name="dailyMinutes"
      render={({ field }) => (
        <Stack gap={2} accessibilityRole="radiogroup">
          {DAILY_MINUTES.map((m) => (
            <OptionCard key={m} title={t(`dailyTime.${m}`)} icon="time-outline" selected={field.value === m} onPress={() => field.onChange(m)} testID={`minutes-${m}`} />
          ))}
        </Stack>
      )}
    />
  );
}
