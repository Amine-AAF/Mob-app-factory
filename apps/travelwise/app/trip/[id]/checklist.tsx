import { useLocalSearchParams } from 'expo-router';

import { SectionComingSoon, TripScaffold } from '@/components/TripScaffold';

/** Checklist section — delivered in a later phase (see factory/tracking/travelwise.md). */
export default function TripChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <TripScaffold tripId={id} section="checklist">
      {() => <SectionComingSoon icon="checkbox-outline" />}
    </TripScaffold>
  );
}
