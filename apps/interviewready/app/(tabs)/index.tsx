import { Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="caption" tone="primary">{t('app.name')}</Text>
      <Text variant="title">{t('home.greeting')}</Text>
      <Text tone="muted">{t('home.comingSoon')}</Text>
    </Screen>
  );
}
