import { Badge, Card, Icon, ProgressBar, Row, Stack, Text, useTheme, type IconName } from '@factory/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CATEGORY_META, JOB_ROLE_META } from '@/content/taxonomy';
import type { CategoryId, Difficulty, JobRoleId, Question } from '@/types/content';

/**
 * Reusable content components. They receive data as props and never read the
 * database themselves, which keeps them simple to test and reuse.
 */

const DIFFICULTY_TONE: Record<Difficulty, 'success' | 'warning' | 'danger'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  const { t } = useTranslation();
  return <Badge label={t(`difficulty.${level}`)} tone={DIFFICULTY_TONE[level]} />;
}

export function PremiumBadge() {
  const { t } = useTranslation();
  return <Badge label={t('common.premium')} tone="accent" icon="diamond-outline" />;
}

export function QuestionCard({
  question,
  onPress,
  favorite,
  studied,
  locked,
  testID,
}: {
  question: Pick<Question, 'id' | 'question' | 'category' | 'topic' | 'difficulty' | 'premium'>;
  onPress: () => void;
  favorite?: boolean;
  studied?: boolean;
  locked?: boolean;
  testID?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={question.question} testID={testID ?? `question-${question.id}`}>
      <Stack gap={2}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
            {t(`categories.${question.category}`)} · {t(`topics.${question.topic}`)}
          </Text>
          <Row gap={1}>
            {studied ? <Icon name="checkmark-circle" size={18} color={theme.colors.success} accessibilityLabel={t('question.studied')} /> : null}
            {favorite ? <Icon name="bookmark" size={18} color={theme.colors.primary} accessibilityLabel={t('question.favorite')} /> : null}
          </Row>
        </Row>
        <Text variant="subheading">{question.question}</Text>
        <Row gap={2} wrap>
          <DifficultyBadge level={question.difficulty} />
          {question.premium ? <Badge label={locked ? t('common.locked') : t('common.premium')} tone="accent" icon={locked ? 'lock-closed-outline' : 'diamond-outline'} /> : null}
        </Row>
      </Stack>
    </Card>
  );
}

export function CategoryCard({ category, count, onPress }: { category: CategoryId; count: number; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={t(`categories.${category}`)} testID={`category-${category}`} style={{ flex: 1, minWidth: 150 }}>
      <Stack gap={2}>
        <IconBubble icon={CATEGORY_META[category].icon} color={theme.colors.primary} background={theme.colors.primarySoft} />
        <Text variant="subheading" numberOfLines={2}>
          {t(`categories.${category}`)}
        </Text>
        <Text variant="caption" tone="muted">
          {t('common.questions', { count })}
        </Text>
      </Stack>
    </Card>
  );
}

export function JobCategoryCard({ role, count, selected, onPress }: { role: JobRoleId; count: number; selected?: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card onPress={onPress} tone={selected ? 'primary' : 'default'} accessibilityLabel={t(`roles.${role}`)} testID={`role-${role}`}>
      <Row gap={3}>
        <IconBubble icon={JOB_ROLE_META[role].icon} color={theme.colors.accent} background={theme.colors.accentSoft} />
        <Stack gap={0} style={{ flex: 1 }}>
          <Text variant="subheading">{t(`roles.${role}`)}</Text>
          <Text variant="caption" tone="muted">
            {t('common.questions', { count })}
          </Text>
        </Stack>
        <Icon name="chevron-forward" size={18} color={theme.colors.textSubtle} />
      </Row>
    </Card>
  );
}

export function ProgressCard({ title, studied, total, onPress }: { title: string; studied: number; total: number; onPress?: () => void }) {
  const { t } = useTranslation();
  const ratio = total ? studied / total : 0;
  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <Stack gap={2}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="subheading">{title}</Text>
          <Text variant="subheading" tone="primary">
            {Math.round(ratio * 100)}%
          </Text>
        </Row>
        <ProgressBar progress={ratio} label={title} />
        <Text variant="caption" tone="muted">
          {t('progress.studiedOf', { studied, total })}
        </Text>
      </Stack>
    </Card>
  );
}

/** A titled section of a question's answer (intent, model answer, tips…). */
export function AnswerCard({ title, icon, children, tone = 'default' }: { title: string; icon: IconName; children: ReactNode; tone?: 'default' | 'alt' | 'primary' }) {
  const theme = useTheme();
  return (
    <Card tone={tone}>
      <Stack gap={2}>
        <Row gap={2}>
          <Icon name={icon} size={18} color={theme.colors.primary} />
          <Text variant="label" tone="primary" accessibilityRole="header">
            {title}
          </Text>
        </Row>
        {children}
      </Stack>
    </Card>
  );
}

export function BulletList({ items }: { items: readonly string[] }) {
  return (
    <Stack gap={2}>
      {items.map((item, i) => (
        <Row key={i} gap={2} style={{ alignItems: 'flex-start' }}>
          <Text tone="primary">•</Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </Row>
      ))}
    </Stack>
  );
}

function IconBubble({ icon, color, background }: { icon: IconName; color: string; background: string }) {
  return (
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} color={color} />
    </View>
  );
}
