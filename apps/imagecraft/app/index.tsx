import { Redirect } from 'expo-router';

import { useSession } from '@/store/session';

export default function Index() {
  const onboarded = useSession((s) => s.onboardingCompleted);
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
