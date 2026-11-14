import { Redirect } from 'expo-router';

import { usePreferences } from '@/store/preferences';

export default function Index() {
  const done = usePreferences((s) => s.onboardingCompleted);
  return <Redirect href={done ? '/(tabs)' : '/onboarding'} />;
}
