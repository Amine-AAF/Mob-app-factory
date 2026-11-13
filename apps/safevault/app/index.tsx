import { Redirect } from 'expo-router';

import { useVault } from '@/store/vault';

/** Entry point: routes by vault state. */
export default function Index() {
  const status = useVault((s) => s.status);
  if (status === 'loading') return null;
  if (status === 'none') return <Redirect href="/welcome" />;
  if (status === 'locked') return <Redirect href="/unlock" />;
  return <Redirect href="/(tabs)" />;
}
