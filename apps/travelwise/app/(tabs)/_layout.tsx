import { Icon, useTheme, type IconName } from '@factory/design-system';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

const TABS: { name: string; key: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', key: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'trips', key: 'trips', icon: 'airplane-outline', iconActive: 'airplane' },
  { name: 'places', key: 'places', icon: 'map-outline', iconActive: 'map' },
  { name: 'budget', key: 'budget', icon: 'wallet-outline', iconActive: 'wallet' },
  { name: 'settings', key: 'settings', icon: 'settings-outline', iconActive: 'settings' },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`tabs.${tab.key}`),
            tabBarIcon: ({ color, focused, size }) => <Icon name={focused ? tab.iconActive : tab.icon} size={size - 2} color={color as string} />,
          }}
        />
      ))}
    </Tabs>
  );
}
