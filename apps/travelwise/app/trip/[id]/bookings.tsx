import { useLocalSearchParams } from 'expo-router';

import { SectionComingSoon, TripScaffold } from '@/components/TripScaffold';

/** Bookings section — delivered in a later phase (see factory/tracking/travelwise.md). */
export default function TripBookingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TripScaffold tripId={id} section="bookings">
      {() => <SectionComingSoon icon="ticket-outline" />}
    </TripScaffold>
  );
}
