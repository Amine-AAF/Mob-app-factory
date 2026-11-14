import { Button, Card, Chip, Icon, Row, Screen, SectionHeader, Stack, Text, useTheme } from '@factory/design-system';
import * as Clipboard from 'expo-clipboard';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, TextInput } from 'react-native';

import { repos } from '@/database';
import {
  BUILDER_STRUCTURES,
  checkAnswer,
  composeAnswer,
  SECTION_MAX_LENGTH,
  speakingSeconds,
  STRUCTURE_SECTIONS,
  wordCount,
  type AnswerFields,
} from '@/features/answer-builder/templates';
import { useQuestions } from '@/hooks/useContent';
import { recordError } from '@/services/analytics';
import { saveBuilderAnswer } from '@/services/practice';
import { useSession } from '@/store/session';
import { DIFFICULTIES, JOB_ROLES, SKILLS, type AnswerStructure, type Difficulty, type JobRoleId, type SkillId } from '@/types/content';

/**
 * Guided answer editor. No ads are shown while writing. Model answers can be opened
 * for comparison, but they are examples, not texts to copy.
 */
export default function BuilderEdit() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; questionId?: string }>();
  const profile = useSession((s) => s.profile);
  const questions = useQuestions();

  const [answerId, setAnswerId] = useState<number | undefined>(params.id ? Number(params.id) : undefined);
  const [questionId, setQuestionId] = useState<string | null>(params.questionId ?? null);
  const linked = questions.find((q) => q.id === questionId);
  const [structure, setStructure] = useState<AnswerStructure>(linked?.structure ?? 'star');
  const [role, setRole] = useState<JobRoleId | null>(profile?.jobRole ?? null);
  const [level, setLevel] = useState<Difficulty>(profile?.level ?? 'beginner');
  const [skill, setSkill] = useState<SkillId | null>(linked?.skills[0] ?? null);
  const [title, setTitle] = useState(linked?.question ?? '');
  const [fields, setFields] = useState<AnswerFields>({});
  const [status, setStatus] = useState<'draft' | 'final'>('draft');
  const [showExample, setShowExample] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    repos()
      .practice.getAnswer(Number(params.id))
      .then((a) => {
        if (!a) return;
        setQuestionId(a.questionId);
        setStructure(a.structure);
        setRole(a.jobRole);
        setLevel(a.level ?? 'beginner');
        setSkill((a.skill as SkillId | null) ?? null);
        setTitle(a.title);
        setFields(a.fields);
        setStatus(a.status);
      })
      .catch((e) => recordError(e, 'builder_load'));
  }, [params.id]);

  const composed = useMemo(() => composeAnswer(structure, fields), [structure, fields]);
  const checks = useMemo(() => checkAnswer(structure, fields), [structure, fields]);

  const save = async (nextStatus: 'draft' | 'final') => {
    try {
      const id = await saveBuilderAnswer({
        id: answerId,
        questionId,
        title: title.trim() || t('builder.untitled'),
        structure,
        fields,
        jobRole: role,
        level,
        skill,
        status: nextStatus,
      });
      setAnswerId(id);
      setStatus(nextStatus);
      setNotice(t('common.saved'));
    } catch (e) {
      recordError(e, 'builder_save');
      setNotice(t('common.error'));
    }
  };

  const copy = async () => {
    await Clipboard.setStringAsync(composed);
    setNotice(t('common.copied'));
  };

  const remove = () => {
    if (!answerId) return router.back();
    Alert.alert(t('builder.deleteTitle'), t('builder.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await repos().practice.deleteAnswer(answerId);
          useSession.getState().bump();
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={[]} testID="builder-edit">
      <RouterStack.Screen options={{ title: t('practice.builder.title') }} />

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t('builder.titlePlaceholder')}
        placeholderTextColor={theme.colors.textSubtle}
        maxLength={200}
        accessibilityLabel={t('builder.titleLabel')}
        style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700', paddingVertical: 4 }}
        testID="builder-title"
      />

      <SectionHeader title={t('builder.type')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {BUILDER_STRUCTURES.map((s) => (
          <Chip key={s} label={t(`builder.structure.${s}`)} selected={structure === s} onPress={() => setStructure(s)} testID={`structure-${s}`} />
        ))}
      </ScrollView>
      <Text variant="caption" tone="muted">
        {t(`builder.structureHint.${structure}`)}
      </Text>

      <SectionHeader title={t('builder.context')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label={t('mock.generalRole')} selected={role === null} onPress={() => setRole(null)} />
        {JOB_ROLES.map((r) => (
          <Chip key={r} label={t(`roles.${r}`)} selected={role === r} onPress={() => setRole(r)} />
        ))}
      </ScrollView>
      <Row wrap gap={2}>
        {DIFFICULTIES.map((d) => (
          <Chip key={d} label={t(`difficulty.${d}`)} selected={level === d} onPress={() => setLevel(d)} />
        ))}
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {SKILLS.map((s) => (
          <Chip key={s} label={t(`skills.${s}`)} selected={skill === s} onPress={() => setSkill(skill === s ? null : s)} />
        ))}
      </ScrollView>

      {STRUCTURE_SECTIONS[structure].map((key) => (
        <Stack key={key} gap={1}>
          <Text variant="subheading">{t(`builder.section.${key}.label`)}</Text>
          <Text variant="caption" tone="muted">
            {t(`builder.section.${key}.hint`)}
          </Text>
          <TextInput
            value={fields[key] ?? ''}
            onChangeText={(v) => setFields((f) => ({ ...f, [key]: v }))}
            multiline
            maxLength={SECTION_MAX_LENGTH}
            accessibilityLabel={t(`builder.section.${key}.label`)}
            placeholderTextColor={theme.colors.textSubtle}
            style={{
              minHeight: 90,
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: theme.radius.md,
              padding: 12,
              textAlignVertical: 'top',
              fontSize: 16,
            }}
            testID={`section-${key}`}
          />
        </Stack>
      ))}

      <SectionHeader title={t('builder.preview')} />
      <Card tone="alt">
        <Stack gap={2}>
          <Text selectable>{composed || t('builder.empty')}</Text>
          <Text variant="caption" tone="muted">
            {t('builder.stats', { words: wordCount(composed), seconds: speakingSeconds(composed) })}
          </Text>
        </Stack>
      </Card>
      <Stack gap={1}>
        {checks.map((c) => (
          <Row key={c.key} gap={2}>
            <Icon name={c.ok ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={c.ok ? theme.colors.success : theme.colors.textSubtle} />
            <Text variant="bodySmall" style={{ flex: 1 }}>
              {t(`builder.check.${c.key}`)}
            </Text>
          </Row>
        ))}
        <Text variant="caption" tone="subtle">
          {t('builder.checksNote')}
        </Text>
      </Stack>

      {linked ? (
        <Card>
          <Stack gap={2}>
            <Button
              label={showExample ? t('builder.hideExample') : t('builder.compare')}
              variant="ghost"
              icon="git-compare-outline"
              onPress={() => setShowExample((v) => !v)}
              testID="builder-compare"
            />
            {showExample ? (
              <>
                <Text>{linked.expectedAnswer}</Text>
                <Text variant="caption" tone="subtle">
                  {t('question.adaptDisclaimer')}
                </Text>
              </>
            ) : null}
          </Stack>
        </Card>
      ) : null}

      {notice ? <Text tone="primary">{notice}</Text> : null}
      <Row gap={2} wrap>
        <Button label={t('builder.saveDraft')} variant="secondary" onPress={() => save('draft')} testID="builder-save" />
        <Button label={status === 'final' ? t('builder.final') : t('builder.markFinal')} onPress={() => save('final')} />
      </Row>
      <Row gap={2} wrap>
        <Button label={t('common.copy')} icon="copy-outline" variant="ghost" onPress={copy} disabled={!composed} />
        <Button label={t('common.delete')} icon="trash-outline" variant="ghost" onPress={remove} />
      </Row>
    </Screen>
  );
}
