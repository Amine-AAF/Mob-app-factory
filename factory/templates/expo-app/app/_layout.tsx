import { ThemeProvider } from '@factory/design-system';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import manifest from '../app.manifest.json';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider brand={{ primary: manifest.brand.primary, accent: manifest.brand.accent }} preference="system">
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
