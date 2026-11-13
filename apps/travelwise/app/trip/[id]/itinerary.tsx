import { useLocalSearchParams } from 'expo-router';

import { SectionComingSoon, TripScaffold } from '@/components/TripScaffold';

/** Itinerary section — delivered in a later phase (see factory/tracking/travelwise.md). */
export default function TripItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TripScaffold tripId={id} section="itinerary">
      {() => <SectionComingSoon icon="map-outline" />}
    </TripScaffold>
  );
}
