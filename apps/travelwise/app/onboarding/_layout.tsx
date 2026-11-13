import { useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  const theme = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: 'slide_from_right' }} />;
}
