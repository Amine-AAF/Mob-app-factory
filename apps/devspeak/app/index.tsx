import { Redirect } from 'expo-router';

import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

export default function Index() {
  const onboarded = usePreferences((s) => s.onboardingCompleted);
  const profile = useSession((s) => s.profile);
  // A profile is required: if data was deleted, onboarding runs again.
  return <Redirect href={onboarded && profile ? '/(tabs)' : '/onboarding'} />;
}
