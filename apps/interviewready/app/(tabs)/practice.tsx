import { EmptyState, Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

export default function PracticeScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('practice.title')}</Text>
      <Text tone="muted">{t('practice.subtitle')}</Text>
      <EmptyState icon="hourglass-outline" title={t('empty.nothingYet')} />
    </Screen>
  );
}
