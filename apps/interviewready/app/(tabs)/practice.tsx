import { Badge, Card, Icon, Row, Screen, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { clock } from '@/services/clock';

interface Mode {
  key: 'path' | 'quiz' | 'review' | 'mock' | 'builder' | 'flashcards';
  icon: IconName;
  available: boolean;
  onPress?: () => void;
}

export default function PracticeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: due } = useAsync(() => repos().review.dueCount('quiz', clock.today()), []);

  const modes: Mode[] = [
    { key: 'path', icon: 'map-outline', available: true, onPress: () => router.push('/path') },
    { key: 'mock', icon: 'videocam-outline', available: true, onPress: () => router.push('/mock') },
    { key: 'builder', icon: 'construct-outline', available: true, onPress: () => router.push('/builder') },
    { key: 'quiz', icon: 'help-circle-outline', available: true, onPress: () => router.push('/quiz') },
    { key: 'flashcards', icon: 'albums-outline', available: true, onPress: () => router.push('/flashcards') },
    { key: 'review', icon: 'refresh-circle-outline', available: true, onPress: () => router.push({ pathname: '/quiz', params: { mode: 'review' } }) },
  ];

  return (
    <Screen testID="practice">
      <Text variant="title" accessibilityRole="header">
        {t('practice.title')}
      </Text>
      <Text tone="muted">{t('practice.subtitle')}</Text>
      {modes.map((m) => (
        <Card key={m.key} onPress={m.available ? m.onPress : undefined} accessibilityLabel={t(`practice.${m.key}.title`)} testID={`practice-${m.key}`}>
          <Row gap={3}>
            <Icon name={m.icon} size={28} color={m.available ? theme.colors.primary : theme.colors.textSubtle} />
            <Stack gap={1} style={{ flex: 1 }}>
              <Row gap={2} wrap>
                <Text variant="subheading">{t(`practice.${m.key}.title`)}</Text>
                {m.key === 'review' && (due ?? 0) > 0 ? <Badge label={t('practice.dueCount', { count: due ?? 0 })} tone="warning" /> : null}
              </Row>
              <Text variant="bodySmall" tone="muted">
                {t(`practice.${m.key}.body`)}
              </Text>
            </Stack>
            {m.available ? <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} /> : null}
          </Row>
        </Card>
      ))}
    </Screen>
  );
}
