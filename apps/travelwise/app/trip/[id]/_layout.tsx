import { useTheme } from '@factory/design-system';
import { Stack } from 'expo-router';

export default function TripLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.colors.background },
        // Section switches replace the screen: no slide, feels like tabs.
        animation: 'fade',
      }}
    >
      <Stack.Screen name="edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
