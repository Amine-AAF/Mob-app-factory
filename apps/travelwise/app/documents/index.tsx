import { Button, Card, Chip, EmptyState, Icon, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DocumentsGate } from '@/components/DocumentsGate';
import { TravelDocumentCard } from '@/components/TravelDocumentCard';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { clock } from '@/utils/clock';

/** Travel documents, all trips or one trip. No ad is ever shown on document screens. */
export default function DocumentsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const [scope, setScope] = useState<'trip' | 'all'>(tripId ? 'trip' : 'all');
  const { data } = useAsync(async () => {
    const [docs, trips] = await Promise.all([repos().documents.list(scope === 'trip' && tripId ? tripId : undefined), repos().trips.list()]);
    return { docs, tripNames: new Map(trips.map((x) => [x.id, x.name])) };
  }, [scope, tripId]);
  const today = clock.today();

  return (
    <DocumentsGate>
      <Screen edges={[]} testID="documents-screen">
        <RouterStack.Screen options={{ headerShown: true, title: t('documents.title') }} />
        <Card tone="alt">
          <Row gap={2} style={{ alignItems: 'flex-start' }}>
            <Icon name="shield-checkmark-outline" size={18} color={theme.colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {t('documents.privacyNote')}
            </Text>
          </Row>
        </Card>
        <Button label={t('documents.add')} icon="add" onPress={() => router.push({ pathname: '/documents/new', params: tripId ? { tripId } : {} })} testID="documents-add" />
        {tripId ? (
          <Row gap={2}>
            <Chip label={t('documents.thisTrip')} selected={scope === 'trip'} onPress={() => setScope('trip')} />
            <Chip label={t('documents.allTrips')} selected={scope === 'all'} onPress={() => setScope('all')} />
          </Row>
        ) : null}
        {data && data.docs.length === 0 ? <EmptyState icon="folder-open-outline" title={t('documents.emptyTitle')} message={t('documents.emptyMessage')} /> : null}
        <Stack gap={3}>
          {(data?.docs ?? []).map((d) => (
            <TravelDocumentCard key={d.id} doc={d} today={today} tripName={d.tripId ? data!.tripNames.get(d.tripId) : undefined} onPress={() => router.push({ pathname: '/documents/[docId]', params: { docId: d.id } })} />
          ))}
        </Stack>
      </Screen>
    </DocumentsGate>
  );
}
