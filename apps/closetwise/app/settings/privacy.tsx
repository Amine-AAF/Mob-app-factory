import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { Card, Icon, ListRow, Row, Screen, Stack, Text, useTheme, type IconName } from '@/ui';

const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL;

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const points: { icon: IconName; title: string; body: string }[] = [
    { icon: 'person-outline', title: t('settings.privacyPage.account.title'), body: t('settings.privacyPage.account.body') },
    { icon: 'phone-portrait-outline', title: t('settings.privacyPage.local.title'), body: t('settings.privacyPage.local.body') },
    { icon: 'swap-horizontal-outline', title: t('settings.privacyPage.transfer.title'), body: t('settings.privacyPage.transfer.body') },
    { icon: 'key-outline', title: t('settings.privacyPage.permissions.title'), body: t('settings.privacyPage.permissions.body') },
    { icon: 'notifications-outline', title: t('settings.privacyPage.notifications.title'), body: t('settings.privacyPage.notifications.body') },
    { icon: 'megaphone-outline', title: t('settings.privacyPage.ads.title'), body: t('settings.privacyPage.ads.body') },
    { icon: 'analytics-outline', title: t('settings.privacyPage.analytics.title'), body: t('settings.privacyPage.analytics.body') },
    { icon: 'trash-outline', title: t('settings.privacyPage.control.title'), body: t('settings.privacyPage.control.body') },
  ];
  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.privacyPage.title') }} />
      <Text variant="title">{t('settings.privacyPage.headline')}</Text>
      {points.map((p) => (
        <PrivacyPoint key={p.title} {...p} />
      ))}
      {PRIVACY_URL || TERMS_URL ? (
        <Card style={{ paddingVertical: 0, gap: 0 }}>
          {PRIVACY_URL ? <ListRow icon="document-lock-outline" title={t('settings.privacyPage.policy')} onPress={() => void Linking.openURL(PRIVACY_URL)} right={<Icon name="open-outline" size={16} color={theme.colors.textSubtle} />} /> : null}
          {TERMS_URL ? <ListRow icon="document-text-outline" title={t('settings.privacyPage.terms')} onPress={() => void Linking.openURL(TERMS_URL)} right={<Icon name="open-outline" size={16} color={theme.colors.textSubtle} />} /> : null}
        </Card>
      ) : null}
    </Screen>
  );
}

function PrivacyPoint({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const theme = useTheme();
  return (
    <Row gap={3} style={{ alignItems: 'flex-start' }}>
      <Icon name={icon} size={20} color={theme.colors.accent} style={{ marginTop: 2 }} />
      <Stack gap={1} style={{ flex: 1 }}>
        <Text variant="heading">{title}</Text>
        <Text tone="muted">{body}</Text>
      </Stack>
    </Row>
  );
}
