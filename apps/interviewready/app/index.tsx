import { Redirect } from 'expo-router';

import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

/** Entry point: onboarding until it is completed and a profile exists (it runs again after "Delete my data"). */
export default function Index() {
  const onboarded = usePreferences((s) => s.onboardingCompleted);
  const profile = useSession((s) => s.profile);
  return <Redirect href={onboarded && profile ? '/(tabs)' : '/onboarding'} />;
}
