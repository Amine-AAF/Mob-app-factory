import { Card, Divider, ListRow, Screen, Stack, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { Notice } from '@/components/vault';
import { APP_VERSION } from '@/config/brand';
import { engineStatus } from '@/crypto/kdf';
import { useVault } from '@/store/vault';

export default function About() {
  const { t } = useTranslation();
  const info = useVault((s) => s.info);
  const engine = engineStatus();
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL;
  return (
    <Screen edges={[]}>
      <Card>
        <Text variant="heading">{t('about.howTitle')}</Text>
        <Text variant="bodySmall">{t('about.how')}</Text>
      </Card>
      <Card>
        <Text variant="heading">{t('about.technicalTitle')}</Text>
        <Stack gap={1}>
          <Text variant="bodySmall">{t('about.kdf', { m: Math.round((info?.kdf.memoryKiB ?? 0) / 1024), t: info?.kdf.iterations ?? 0, p: info?.kdf.parallelism ?? 0 })}</Text>
          <Text variant="bodySmall">{t('about.cipher')}</Text>
          <Text variant="bodySmall">{t(`about.engine.${engine.engine}`)}</Text>
          <Text variant="bodySmall">{t('about.keyVersion', { version: info?.keyVersion ?? 1 })}</Text>
        </Stack>
      </Card>
      <Notice tone="warning" title={t('about.limitsTitle')}>
        <Stack gap={1}>
          {(t('about.limits', { returnObjects: true }) as string[]).map((l, i) => (
            <Text key={i} variant="bodySmall">{`• ${l}`}</Text>
          ))}
        </Stack>
      </Notice>
      <Card>
        <Text variant="heading">{t('about.privacyTitle')}</Text>
        <Text variant="bodySmall">{t('about.privacy')}</Text>
        {privacyUrl ? (
          <>
            <Divider />
            <ListRow icon="document-text" title={t('about.privacyPolicy')} onPress={() => void Linking.openURL(privacyUrl)} />
          </>
        ) : null}
      </Card>
      <Text variant="caption" tone="subtle" center>
        {t('about.version', { version: APP_VERSION })}
      </Text>
    </Screen>
  );
}
