import { Redirect } from 'expo-router';

/** Entry point. Onboarding is wired in Phase 3; until then the app opens on the dashboard. */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
