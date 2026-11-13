import { Badge, Card, Icon, IconButton, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Translated } from '@/content/types';
import type { LessonSummary } from '@/database/repositories/contentRepository';
import { useTranslationLanguage } from '@/hooks/useTranslationLanguage';
import { speak, stopSpeaking } from '@/services/speech';
import { usePreferences } from '@/store/preferences';

/** Shows the helper translation for the user's chosen language, if any. */
export function HelperTranslation({ value, initiallyVisible = false }: { value: Translated; initiallyVisible?: boolean }) {
  const { t } = useTranslation();
  const lang = useTranslationLanguage();
  const [visible, setVisible] = useState(initiallyVisible);
  if (!lang || !value[lang]) return null;
  return (
    <View>
      <Pressable onPress={() => setVisible((v) => !v)} accessibilityRole="button" hitSlop={8}>
        <Text variant="caption" tone="primary" style={{ fontWeight: '700' }}>
          {visible ? t('common.hideTranslation') : t('common.showTranslation')}
        </Text>
      </Pressable>
      {visible ? (
        <Text variant="bodySmall" tone="muted" style={{ marginTop: 4, fontStyle: 'italic' }} lang={lang}>
          {value[lang]}
        </Text>
      ) : null}
    </View>
  );
}

/** Inline translation, always visible (used where space allows, e.g. vocabulary). */
export function InlineTranslation({ value }: { value: Translated }) {
  const lang = useTranslationLanguage();
  if (!lang || !value[lang]) return null;
  return (
    <Text variant="bodySmall" tone="accent" style={{ fontWeight: '600' }}>
      {value[lang]}
    </Text>
  );
}

/** Speaks English text using device TTS. */
export function SpeakButton({ text, label, size = 20 }: { text: string; label?: string; size?: number }) {
  const { t } = useTranslation();
  const rate = usePreferences((s) => s.speechRate);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  return (
    <IconButton
      icon={speaking ? 'stop-circle-outline' : 'volume-high-outline'}
      tone="primary"
      size={size}
      label={label ?? t('common.listen')}
      onPress={() => {
        if (speaking) {
          stopSpeaking();
          setSpeaking(false);
          return;
        }
        setSpeaking(true);
        speak(text, { rate, onDone: () => setSpeaking(false), onError: () => setSpeaking(false) });
      }}
    />
  );
}

export function LevelBadge({ level }: { level: LessonSummary['level'] }) {
  const { t } = useTranslation();
  const tone = level === 'beginner' ? 'success' : level === 'intermediate' ? 'primary' : 'warning';
  return <Badge label={t(`levels.${level}`)} tone={tone} />;
}

export function LessonCard({
  lesson,
  status,
  locked,
  onPress,
}: {
  lesson: LessonSummary;
  status?: { status: 'started' | 'completed'; bestScore: number | null };
  locked: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const lang = useTranslationLanguage();
  const done = status?.status === 'completed';
  return (
    <Card onPress={onPress} accessibilityLabel={`${lesson.title}. ${t(`levels.${lesson.level}`)}. ${locked ? t('common.locked') : ''}`} testID={`lesson-${lesson.id}`}>
      <Row style={{ alignItems: 'flex-start' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? theme.colors.successSoft : locked ? theme.colors.surfaceAlt : theme.colors.primarySoft,
          }}
        >
          <Icon
            name={done ? 'checkmark' : locked ? 'lock-closed' : status?.status === 'started' ? 'play' : 'book-outline'}
            size={18}
            color={done ? theme.colors.success : locked ? theme.colors.textSubtle : theme.colors.primary}
          />
        </View>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="subheading">{lesson.title}</Text>
          {lang ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {lesson.titleTranslation[lang]}
            </Text>
          ) : null}
          <Row gap={2} wrap style={{ marginTop: 4 }}>
            <LevelBadge level={lesson.level} />
            <Badge label={t('common.minutes', { count: lesson.minutes })} tone="neutral" icon="time-outline" />
            {lesson.premium ? <Badge label={t('common.premium')} tone="accent" icon="diamond-outline" /> : null}
            {done && status?.bestScore != null ? <Badge label={`${status.bestScore}%`} tone="success" /> : null}
          </Row>
        </Stack>
      </Row>
    </Card>
  );
}

export function SectionTitle({ icon, title }: { icon: IconName; title: string }) {
  const theme = useTheme();
  return (
    <Row gap={2} style={{ marginTop: 8 }}>
      <Icon name={icon} size={18} color={theme.colors.accent} />
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
    </Row>
  );
}

/** Seven-day bar chart of XP. */
export function WeeklyBars({ days }: { days: { label: string; xp: number; isToday: boolean }[] }) {
  const theme = useTheme();
  const max = Math.max(50, ...days.map((d) => d.xp));
  return (
    <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', height: 110 }} gap={2}>
      {days.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`${d.label}: ${d.xp} XP`}>
          <View style={{ height: 80, justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
            <View
              style={{
                width: '62%',
                height: Math.max(4, (d.xp / max) * 80),
                borderRadius: 6,
                backgroundColor: d.xp > 0 ? (d.isToday ? theme.colors.accent : theme.colors.primary) : theme.colors.surfaceAlt,
              }}
            />
          </View>
          <Text variant="caption" tone={d.isToday ? 'default' : 'subtle'} style={{ fontWeight: d.isToday ? '800' : '500' }}>
            {d.label}
          </Text>
        </View>
      ))}
    </Row>
  );
}
