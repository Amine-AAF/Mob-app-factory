import { Icon, useTheme, type IconName } from '@factory/design-system';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

const TABS: { name: string; icon: IconName; key: string }[] = [
  { name: 'index', icon: 'shield-checkmark', key: 'vault' },
  { name: 'categories', icon: 'folder', key: 'categories' },
  { name: 'generator', icon: 'dice', key: 'generator' },
  { name: 'security', icon: 'pulse', key: 'security' },
  { name: 'settings', icon: 'settings', key: 'settings' },
];

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        animation: 'none',
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`tabs.${tab.key}`),
            tabBarAccessibilityLabel: t(`tabs.${tab.key}`),
            tabBarIcon: ({ color, size }) => <Icon name={tab.icon} color={color as string} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
