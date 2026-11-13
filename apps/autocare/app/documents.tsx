import { Stack as RouterStack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { DocumentsView } from '@/screens/DocumentsView';

/** All documents, including those not linked to a vehicle. */
export default function AllDocuments() {
  const { t } = useTranslation();
  return (
    <>
      <RouterStack.Screen options={{ title: t('documents.title') }} />
      <DocumentsView />
    </>
  );
}
