import { EmptyState, Screen, Text } from '@factory/design-system';
import { useTranslation } from 'react-i18next';

/** Saved places arrive in Phase 5; the tab exists so navigation is final from day one. */
export default function PlacesScreen() {
  const { t } = useTranslation();
  return (
    <Screen testID="places-screen">
      <Text variant="title" accessibilityRole="header">
        {t('placesTab.title')}
      </Text>
      <EmptyState icon="map-outline" title={t('placesTab.empty')} />
    </Screen>
  );
}
