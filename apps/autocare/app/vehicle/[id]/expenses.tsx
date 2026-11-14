import { Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ExpensesView } from '@/screens/ExpensesView';

export default function VehicleExpenses() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <RouterStack.Screen options={{ title: t('expenses.title') }} />
      <ExpensesView fixedVehicleId={id} />
    </>
  );
}
