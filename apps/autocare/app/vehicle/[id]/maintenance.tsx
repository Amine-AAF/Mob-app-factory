import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { MaintenanceView } from '@/screens/MaintenanceView';

export default function VehicleMaintenance() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouterStack.Screen options={{ title: t('maintenance.title') }} />
      <MaintenanceView fixedVehicleId={id} />
    </>
  );
}
