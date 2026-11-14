import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Icon, useTheme, type IconName } from '@/ui';

const TABS: { name: string; key: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', key: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'wardrobe', key: 'wardrobe', icon: 'shirt-outline', iconActive: 'shirt' },
  { name: 'outfits', key: 'outfits', icon: 'layers-outline', iconActive: 'layers' },
  { name: 'calendar', key: 'calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'profile', key: 'profile', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`common.tabs.${tab.key}`),
            tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? tab.iconActive : tab.icon} size={size - 2} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
