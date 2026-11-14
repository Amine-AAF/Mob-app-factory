import { Button, Chip, IconButton, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable } from 'react-native';

import { TextField } from '@/components/ui';
import { questionSchema } from '@/content/schema';
import type { QuestionType, QuizQuestion } from '@/content/types';
import { repos } from '@/database';
import { useSession } from '@/store/session';

const TYPES: QuestionType[] = ['single', 'multiple', 'true_false', 'short_answer', 'matching'];

/** Editor for the learner's own questions (stored in the subject's bank). */
export default function QuestionEditor() {
  const { t } = useTranslation();
  const theme = useTheme();
  const bump = useSession((s) => s.bump);
  const { subjectId, id } = useLocalSearchParams<{ subjectId: string; id?: string }>();
  const [type, setType] = useState<QuestionType>('single');
  const [prompt, setPrompt] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correct, setCorrect] = useState<number[]>([0]);
  const [truth, setTruth] = useState(true);
  const [accepted, setAccepted] = useState('');
  const [pairs, setPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void repos()
      .quiz.getUserQuestion(id)
      .then((s) => {
        if (!s) return;
        const q = s.question;
        setType(q.type);
        setPrompt(q.prompt);
        setExplanation(q.explanation);
        setDifficulty(q.difficulty);
        if (q.type === 'single') {
          setOptions(q.options);
          setCorrect([q.correct]);
        }
        if (q.type === 'multiple') {
          setOptions(q.options);
          setCorrect(q.correct);
        }
        if (q.type === 'true_false') setTruth(q.correct);
        if (q.type === 'short_answer') setAccepted(q.accepted.join('\n'));
        if (q.type === 'matching') setPairs(q.pairs);
      });
  }, [id]);

  const build = (): QuizQuestion => {
    const base = { id: id ?? 'draft', difficulty, prompt: prompt.trim(), explanation: explanation.trim() || '—' };
    const opts = options.map((o) => o.trim()).filter(Boolean);
    switch (type) {
      case 'single':
        return { ...base, type, options: opts, correct: correct[0] ?? 0 };
      case 'multiple':
        return { ...base, type, options: opts, correct: correct.filter((c) => c < opts.length) };
      case 'true_false':
        return { ...base, type, correct: truth };
      case 'short_answer':
        return { ...base, type, accepted: accepted.split(/\n|;/).map((a) => a.trim()).filter(Boolean) };
      case 'matching':
        return { ...base, type, pairs: pairs.map((p) => ({ left: p.left.trim(), right: p.right.trim() })).filter((p) => p.left && p.right) };
    }
  };

  const save = async () => {
    const q = build();
    const result = questionSchema.safeParse({ ...q, id: 'user-question' });
    if (!result.success) return setError(t('quiz.editor.invalid'));
    await repos().quiz.saveUserQuestion(subjectId, q);
    bump();
    router.back();
  };

  const toggleCorrect = (i: number) => {
    if (type === 'single') setCorrect([i]);
    else setCorrect(correct.includes(i) ? correct.filter((c) => c !== i) : [...correct, i]);
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} testID="question-save" />}>
      <RouterStack.Screen
        options={{
          title: id ? t('quiz.editor.edit') : t('quiz.addQuestion'),
          headerRight: id
            ? () => (
                <IconButton
                  icon="trash-outline"
                  label={t('common.delete')}
                  onPress={() =>
                    Alert.alert(t('quiz.editor.deleteTitle'), undefined, [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: async () => {
                          await repos().quiz.removeUserQuestion(id);
                          bump();
                          router.back();
                        },
                      },
                    ])
                  }
                />
              )
            : undefined,
        }}
      />
      <Row gap={2} wrap>
        {TYPES.map((ty) => (
          <Chip key={ty} label={t(`quiz.types.${ty}`)} selected={type === ty} onPress={() => (setType(ty), setCorrect([0]), setError(null))} />
        ))}
      </Row>
      <TextField label={t('quiz.editor.prompt')} value={prompt} onChangeText={(v) => (setPrompt(v), setError(null))} multiline maxLength={400} testID="question-prompt-input" error={error} />
      {type === 'single' || type === 'multiple' ? (
        <Stack gap={2}>
          <Text variant="bodySmall" style={{ fontWeight: '600' }}>
            {t(type === 'single' ? 'quiz.editor.optionsSingle' : 'quiz.editor.optionsMultiple')}
          </Text>
          {options.map((o, i) => (
            <Row key={i} gap={2}>
              <Pressable onPress={() => toggleCorrect(i)} accessibilityRole={type === 'single' ? 'radio' : 'checkbox'} accessibilityState={{ checked: correct.includes(i) }} accessibilityLabel={t('quiz.editor.markCorrect', { n: i + 1 })} hitSlop={8}>
                <Text style={{ fontSize: 22, color: correct.includes(i) ? theme.colors.success : theme.colors.textSubtle }}>{correct.includes(i) ? '●' : '○'}</Text>
              </Pressable>
              <Stack style={{ flex: 1 }}>
                <TextField value={o} onChangeText={(v) => setOptions(options.map((x, j) => (j === i ? v : x)))} placeholder={t('quiz.editor.option', { n: i + 1 })} maxLength={200} />
              </Stack>
              {options.length > 2 ? <IconButton icon="close" size={16} label={t('common.delete')} onPress={() => (setOptions(options.filter((_, j) => j !== i)), setCorrect(correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c))))} /> : null}
            </Row>
          ))}
          {options.length < 6 ? <Button size="md" variant="ghost" icon="add" label={t('quiz.editor.addOption')} onPress={() => setOptions([...options, ''])} /> : null}
        </Stack>
      ) : null}
      {type === 'true_false' ? (
        <Row gap={2}>
          <Chip label={t('quiz.true')} selected={truth} onPress={() => setTruth(true)} />
          <Chip label={t('quiz.false')} selected={!truth} onPress={() => setTruth(false)} />
        </Row>
      ) : null}
      {type === 'short_answer' ? <TextField label={t('quiz.editor.accepted')} hint={t('quiz.editor.acceptedHint')} value={accepted} onChangeText={setAccepted} multiline /> : null}
      {type === 'matching' ? (
        <Stack gap={2}>
          {pairs.map((p, i) => (
            <Row key={i} gap={2}>
              <Stack style={{ flex: 1 }}>
                <TextField value={p.left} onChangeText={(v) => setPairs(pairs.map((x, j) => (j === i ? { ...x, left: v } : x)))} placeholder={t('quiz.editor.left')} />
              </Stack>
              <Stack style={{ flex: 1 }}>
                <TextField value={p.right} onChangeText={(v) => setPairs(pairs.map((x, j) => (j === i ? { ...x, right: v } : x)))} placeholder={t('quiz.editor.right')} />
              </Stack>
            </Row>
          ))}
          {pairs.length < 6 ? <Button size="md" variant="ghost" icon="add" label={t('quiz.editor.addPair')} onPress={() => setPairs([...pairs, { left: '', right: '' }])} /> : null}
        </Stack>
      ) : null}
      <TextField label={t('quiz.editor.explanation')} value={explanation} onChangeText={setExplanation} multiline maxLength={600} />
      <Row gap={2}>
        {([1, 2, 3] as const).map((d) => (
          <Chip key={d} label={t(`quiz.levels.${d}`)} selected={difficulty === d} onPress={() => setDifficulty(d)} />
        ))}
      </Row>
    </Screen>
  );
}
