import { useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text as RNText } from 'react-native';

export const TRIP_SECTIONS = ['overview', 'itinerary', 'bookings', 'budget', 'checklist', 'journal'] as const;
export type TripSection = (typeof TRIP_SECTIONS)[number];

const ROUTES = {
  overview: '/trip/[id]',
  itinerary: '/trip/[id]/itinerary',
  bookings: '/trip/[id]/bookings',
  budget: '/trip/[id]/budget',
  checklist: '/trip/[id]/checklist',
  journal: '/trip/[id]/journal',
} as const;

/** Horizontal section switcher shared by every trip screen. */
export function TripTabBar({ tripId, active }: { tripId: string; active: TripSection }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing(2), paddingVertical: theme.spacing(1) }} accessibilityRole="tablist">
      {TRIP_SECTIONS.map((section) => {
        const selected = section === active;
        return (
          <Pressable
            key={section}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            testID={`trip-tab-${section}`}
            onPress={() => {
              if (!selected) router.replace({ pathname: ROUTES[section], params: { id: tripId } });
            }}
            style={{
              paddingHorizontal: theme.spacing(4),
              paddingVertical: theme.spacing(2),
              borderRadius: theme.radius.pill,
              backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
            }}
          >
            <RNText maxFontSizeMultiplier={theme.maxFontSizeMultiplier} style={{ fontSize: 14, fontWeight: '700', color: selected ? theme.colors.onPrimary : theme.colors.text }}>
              {t(`tripDetail.tabs.${section}`)}
            </RNText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
