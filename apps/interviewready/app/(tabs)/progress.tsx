import { EmptyState, Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

export default function ProgressScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('progress.title')}</Text>
      <Text tone="muted">{t('progress.subtitle')}</Text>
      <EmptyState icon="hourglass-outline" title={t('empty.nothingYet')} />
    </Screen>
  );
}
