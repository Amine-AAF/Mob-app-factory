import { Icon, type IconName } from '@factory/design-system';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useBookTheme } from '@/components/theme';

const TABS: { name: string; key: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', key: 'home', icon: 'home-outline', iconActive: 'home' },
  { name: 'library', key: 'library', icon: 'library-outline', iconActive: 'library' },
  { name: 'discover', key: 'discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'goals', key: 'goals', icon: 'flag-outline', iconActive: 'flag' },
  { name: 'profile', key: 'profile', icon: 'person-circle-outline', iconActive: 'person-circle' },
];

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useBookTheme();
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
