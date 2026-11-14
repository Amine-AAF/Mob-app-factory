import { Chip, Icon, ListRow, Text, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, View } from 'react-native';

import { useBookTheme } from '@/components/theme';
import { Metric, Page, Paper, Section, Serif } from '@/components/ui';
import { CURRENCIES } from '@/config/presets';
import { FREE_PALETTE, PALETTES, type PaletteId } from '@/config/brand';
import { FREE_LIMITS } from '@/config/limits';
import { useData, usePremiumGate, useToday } from '@/hooks';
import { fmt, INTERFACE_LANGUAGES, LANGUAGE_NAMES, type InterfaceLanguage } from '@/i18n';
import { overview } from '@/features/statistics/stats';
import { loadStatsInput } from '@/services/statsService';
import { usePreferences } from '@/store/preferences';
import { useIsPremium } from '@/store/session';
import { syncNotifications } from '@/services/reminders';
import { repos } from '@/database';

/** Navigation row of the profile menus. */
function Link({ icon, title, subtitle, to, testID }: { icon: IconName; title: string; subtitle?: string; to: string; testID?: string }) {
  const theme = useBookTheme();
  return <ListRow icon={icon} title={title} subtitle={subtitle} onPress={() => router.push(to as never)} testID={testID} right={<Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />} />;
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const theme = useBookTheme();
  const today = useToday();
  const premium = useIsPremium();
  const gate = usePremiumGate();
  const prefs = usePreferences();
  const { data } = useData(async (r) => {
    const [input, books, quotes, notes] = await Promise.all([loadStatsInput(r), r.books.count(), r.content.quoteCount(), r.content.noteCount()]);
    return { year: overview(input, Number(today.slice(0, 4))), all: overview(input, null), books, quotes, notes };
  }, [today]);

  const changeLanguage = async (lng: InterfaceLanguage | null) => {
    prefs.set({ interfaceLanguage: lng });
    const { getLocales } = await import('expo-localization');
    const target = lng ?? (getLocales()[0]?.languageCode as InterfaceLanguage | undefined) ?? 'en';
    await i18n.changeLanguage((INTERFACE_LANGUAGES as readonly string[]).includes(target) ? target : 'en');
    // Reminder texts are localized when scheduled.
    void syncNotifications(repos(), i18n.t);
  };

  return (
    <Page testID="profile">
      <Serif size={30}>{t('profile.title')}</Serif>

      <Paper tone={premium ? 'primary' : 'alt'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} accessibilityLabel={t('premium.title')}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name={premium ? 'diamond' : 'diamond-outline'} size={26} color={theme.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700' }}>{premium ? t('premium.active') : t('premium.title')}</Text>
            <Text variant="caption" tone="muted">
              {premium ? t('premium.thanks') : t('premium.freeUsage', { books: data?.books ?? 0, max: FREE_LIMITS.books })}
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
        </View>
      </Paper>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Metric icon="book" value={data ? fmt.integer(data.year.booksRead) : null} label={t('profile.readThisYear')} />
        <Metric icon="library" value={data ? fmt.integer(data.books) : null} label={t('profile.inLibrary')} />
        <Metric icon="chatbox-ellipses" value={data ? fmt.integer(data.quotes) : null} label={t('profile.quotes')} />
        <Metric icon="time" value={data?.all.readingSeconds != null ? fmt.duration(data.all.readingSeconds) : null} label={t('profile.totalTime')} />
      </View>

      <Section title={t('profile.myReading')}>
        <Paper style={{ paddingVertical: 4 }}>
          <Link icon="stats-chart" title={t('stats.title')} to="/stats" testID="link-stats" />
          <Link icon="calendar" title={t('calendar.title')} to="/calendar" testID="link-calendar" />
          <Link icon="timer" title={t('session.historyTitle')} to="/sessions" />
          <Link icon="chatbox-ellipses" title={t('quotes.title')} subtitle={t('profile.count', { count: data?.quotes ?? 0 })} to="/quotes" testID="link-quotes" />
          <Link icon="journal" title={t('journal.title')} subtitle={t('profile.count', { count: data?.notes ?? 0 })} to="/journal" testID="link-journal" />
          <Link icon="trophy" title={t('review.rankingTitle')} to="/ranking" />
          <Link icon="albums" title={t('collections.title')} to="/collections" />
          <Link icon="gift" title={t('wishlist.title')} to="/wishlist" />
        </Paper>
      </Section>

      <Section title={t('settings.appearance')}>
        <Paper style={{ gap: 12 }}>
          <Text variant="label" tone="muted">
            {t('settings.theme')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['system', 'light', 'dark'] as const).map((m) => (
              <Chip key={m} label={t(`settings.themes.${m}`)} selected={prefs.theme === m} onPress={() => prefs.set({ theme: m })} />
            ))}
          </View>
          <Text variant="label" tone="muted">
            {t('settings.palette')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(Object.keys(PALETTES) as PaletteId[]).map((id) => {
              const locked = id !== FREE_PALETTE && !premium;
              const active = (premium ? prefs.palette : FREE_PALETTE) === id;
              return (
                <Pressable key={id} onPress={() => (locked ? gate('themes') : prefs.set({ palette: id }))} accessibilityRole="radio" accessibilityState={{ checked: active }} accessibilityLabel={t(`settings.palettes.${id}`)} style={{ alignItems: 'center', gap: 4 }} testID={`palette-${id}`}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: PALETTES[id].primary, borderWidth: active ? 3 : 0, borderColor: theme.colors.text, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: PALETTES[id].accent }} />
                    {locked ? <Icon name="lock-closed" size={12} color="#fff" style={{ position: 'absolute', bottom: 2 }} /> : null}
                  </View>
                  <Text variant="caption" tone="subtle">
                    {t(`settings.palettes.${id}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text variant="label" tone="muted">
            {t('settings.language')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={t('settings.deviceLanguage')} selected={prefs.interfaceLanguage == null} onPress={() => void changeLanguage(null)} />
            {INTERFACE_LANGUAGES.map((l) => (
              <Chip key={l} label={LANGUAGE_NAMES[l]} selected={prefs.interfaceLanguage === l} onPress={() => void changeLanguage(l)} testID={`lang-${l}`} />
            ))}
          </View>
          <Text variant="label" tone="muted">
            {t('settings.currency')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {CURRENCIES.slice(0, 8).map((c) => (
              <Chip key={c} label={c} selected={prefs.currency === c} onPress={() => prefs.set({ currency: c })} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>{t('settings.haptics')}</Text>
            <Switch value={prefs.haptics} onValueChange={(v) => prefs.set({ haptics: v })} trackColor={{ true: theme.colors.primary }} accessibilityLabel={t('settings.haptics')} />
          </View>
        </Paper>
      </Section>

      <Section title={t('settings.title')}>
        <Paper style={{ paddingVertical: 4 }}>
          <Link icon="notifications" title={t('settings.notifications')} to="/settings/notifications" testID="link-notifications" />
          <Link icon="cloud-download" title={t('settings.data')} subtitle={t('settings.dataHint')} to="/settings/data" testID="link-data" />
          <Link icon="shield-checkmark" title={t('settings.privacy')} to="/settings/privacy" testID="link-privacy" />
        </Paper>
      </Section>
    </Page>
  );
}
