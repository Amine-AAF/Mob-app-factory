import { Redirect } from 'expo-router';

import { usePreferences } from '@/store/preferences';
import { useSession } from '@/store/session';

export default function Index() {
  const onboarded = usePreferences((s) => s.onboardingCompleted);
  const mainCurrency = useSession((s) => s.settings.mainCurrency);
  // The main currency is stored in SQLite: if all data was deleted, onboarding runs again.
  return <Redirect href={onboarded && mainCurrency ? '/(tabs)' : '/onboarding'} />;
}
