import { Redirect } from 'expo-router';

import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

export default function Index() {
  const onboarded = usePreferences((s) => s.onboardingCompleted);
  const hasHome = useSession((s) => s.homes.length > 0);
  // A home is required: if all data was deleted, onboarding runs again.
  return <Redirect href={onboarded && hasHome ? '/(tabs)' : '/onboarding'} />;
}
