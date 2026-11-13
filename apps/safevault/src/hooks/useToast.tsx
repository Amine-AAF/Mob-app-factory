import { Text, useTheme } from '@factory/design-system';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

/** In-app toast. Messages are fixed strings ("Password copied") — never a vault value. */
interface ToastState {
  message: string | null;
  id: number;
  show: (message: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  id: 0,
  show: (message) => set((s) => ({ message, id: s.id + 1 })),
  hide: () => set({ message: null }),
}));

export function useToast() {
  return { show: useToastStore((s) => s.show) };
}

export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { message, id, hide } = useToastStore();
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, 2600);
    return () => clearTimeout(timer);
  }, [message, id, hide]);
  if (!message) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 84, alignItems: 'center' }}>
      <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ backgroundColor: t.scheme === 'dark' ? '#EEF1FA' : '#121726', paddingHorizontal: 18, paddingVertical: 12, borderRadius: t.radius.pill, maxWidth: 480 }}>
        <Text variant="bodySmall" style={{ color: t.scheme === 'dark' ? '#0A0D18' : '#FFFFFF', fontWeight: '600' }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
