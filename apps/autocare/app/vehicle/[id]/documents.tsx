import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { DocumentsView } from '@/screens/DocumentsView';

export default function VehicleDocuments() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouterStack.Screen options={{ title: t('documents.title') }} />
      <DocumentsView vehicleId={id} />
    </>
  );
}
