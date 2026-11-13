import { useLocalSearchParams } from 'expo-router';

import { SectionComingSoon, TripScaffold } from '@/components/TripScaffold';

/** Journal section — delivered in a later phase (see factory/tracking/travelwise.md). */
export default function TripJournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TripScaffold tripId={id} section="journal">
      {() => <SectionComingSoon icon="book-outline" />}
    </TripScaffold>
  );
}
