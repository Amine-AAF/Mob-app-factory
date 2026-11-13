import { Button, Icon, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

function Point({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: t.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={t.colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subheading">{title}</Text>
        <Text variant="bodySmall" tone="muted">
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  return (
    <Screen
      footer={
        <Stack gap={2}>
          <Button label={t('welcome.create')} icon="lock-closed" onPress={() => router.push('/create')} testID="welcome-create" />
          <Button label={t('welcome.restore')} variant="ghost" onPress={() => router.push('/restore')} testID="welcome-restore" />
        </Stack>
      }
    >
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}>
        <View style={{ width: 84, height: 84, borderRadius: 26, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="shield-checkmark" size={44} color={theme.colors.onPrimary} />
        </View>
        <Text variant="display" center>
          SafeVault
        </Text>
        <Text tone="muted" center>
          {t('welcome.tagline')}
        </Text>
      </View>
      <Stack gap={5} style={{ marginTop: 16 }}>
        <Point icon="phone-portrait" title={t('welcome.points.offline.title')} body={t('welcome.points.offline.body')} />
        <Point icon="lock-closed" title={t('welcome.points.encrypted.title')} body={t('welcome.points.encrypted.body')} />
        <Point icon="eye-off" title={t('welcome.points.private.title')} body={t('welcome.points.private.body')} />
        <Point icon="key" title={t('welcome.points.master.title')} body={t('welcome.points.master.body')} />
      </Stack>
    </Screen>
  );
}
