import { EmptyState, Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

export default function ExploreScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('explore.title')}</Text>
      <Text tone="muted">{t('explore.subtitle')}</Text>
      <EmptyState icon="hourglass-outline" title={t('empty.nothingYet')} />
    </Screen>
  );
}
