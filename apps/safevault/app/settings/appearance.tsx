import { Badge, Card, Chip, Row, Screen, Text, useTheme } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { ACCENT_CHOICES } from '@/features/monetization/plan';
import { INTERFACE_LANGUAGES, LANGUAGE_NAMES } from '@/i18n';
import { updateSettings } from '@/services/context';
import { useApp, useIsPremium } from '@/store/app';

export default function Appearance() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const settings = useApp((s) => s.settings);
  const isPremium = useIsPremium();
  return (
    <Screen edges={[]}>
      <Card>
        <Text variant="subheading">{t('settings.appearance.theme')}</Text>
        <Row gap={2} wrap>
          {(['system', 'light', 'dark'] as const).map((th) => (
            <Chip key={th} label={t(`settings.appearance.themes.${th}`)} selected={settings.theme === th} onPress={() => void updateSettings({ theme: th })} />
          ))}
        </Row>
      </Card>
      <Card>
        <Text variant="subheading">{t('settings.appearance.language')}</Text>
        <Row gap={2} wrap>
          <Chip label={t('settings.appearance.deviceLanguage')} selected={settings.language === null} onPress={() => void updateSettings({ language: null })} />
          {INTERFACE_LANGUAGES.map((l) => (
            <Chip
              key={l}
              label={LANGUAGE_NAMES[l]}
              selected={settings.language === l}
              onPress={() => {
                void updateSettings({ language: l });
                void i18n.changeLanguage(l);
              }}
            />
          ))}
        </Row>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{t('settings.appearance.accent')}</Text>
          {!isPremium ? <Badge label={t('premium.badge')} tone="accent" icon="sparkles" /> : null}
        </Row>
        <Row gap={2} wrap>
          {ACCENT_CHOICES.map((c) => (
            <Pressable
              key={c}
              onPress={() => (isPremium ? void updateSettings({ accent: c }) : router.push('/paywall'))}
              accessibilityRole="radio"
              accessibilityState={{ checked: settings.accent === c }}
              accessibilityLabel={c}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c, borderWidth: 3, borderColor: settings.accent === c ? theme.colors.text : 'transparent', opacity: isPremium ? 1 : 0.5 }}
            />
          ))}
        </Row>
      </Card>
    </Screen>
  );
}
