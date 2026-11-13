import { useLocalSearchParams } from 'expo-router';

import { SectionComingSoon, TripScaffold } from '@/components/TripScaffold';

/** Budget section — delivered in a later phase (see factory/tracking/travelwise.md). */
export default function TripBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TripScaffold tripId={id} section="budget">
      {() => <SectionComingSoon icon="wallet-outline" />}
    </TripScaffold>
  );
}
