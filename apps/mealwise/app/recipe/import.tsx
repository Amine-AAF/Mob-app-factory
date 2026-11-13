import { Button, Card, Screen, Stack, Text } from '@factory/design-system';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';

import { Field, Note, useQuantityLabel } from '@/components/ui';
import { repos } from '@/database';
import { ingredientName } from '@/domain/ingredients';
import { parseRecipeText, type ImportedDraft } from '@/domain/recipeImport';
import { canCreateRecipe } from '@/domain/recipes';
import { useLang } from '@/hooks/useLang';
import { useImportDraft } from '@/store/draft';
import { useIsPremium } from '@/store/session';

/** Manual import: paste a recipe as text, preview what was understood, then refine it in the editor. */
export default function ImportRecipe() {
  const { t, lng } = useLang();
  const q = useQuantityLabel();
  const isPremium = useIsPremium();
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<ImportedDraft | null>(null);

  const paste = async () => {
    const clip = await Clipboard.getStringAsync();
    if (clip) setText(clip);
  };

  const analyse = () => setDraft(parseRecipeText(text));

  const open = async () => {
    if (!draft) return;
    if (!canCreateRecipe(await repos().recipes.count(), isPremium)) return router.push({ pathname: '/paywall', params: { source: 'recipe_limit' } });
    useImportDraft.getState().set(draft);
    router.replace('/recipe/edit');
  };

  return (
    <Screen edges={[]}>
      <Text tone="muted">{t('import.intro')}</Text>
      <Field value={text} onChangeText={(v) => { setText(v); setDraft(null); }} multiline placeholder={t('import.placeholder')} testID="import-text" maxLength={20000} />
      <Stack gap={2}>
        <Button label={t('import.paste')} variant="secondary" icon="clipboard-outline" onPress={paste} />
        <Button label={t('import.analyse')} icon="sparkles-outline" onPress={analyse} disabled={!text.trim()} testID="import-analyse" />
      </Stack>
      {draft ? (
        <Card testID="import-preview">
          <Text variant="heading">{draft.title || t('import.untitled')}</Text>
          <Text variant="bodySmall" tone="muted">
            {t('import.found', { ingredients: draft.ingredients.length, steps: draft.steps.length })}
          </Text>
          {draft.ingredients.slice(0, 12).map((i, idx) => (
            <Text key={idx} variant="bodySmall">
              • {q(i.quantity, i.unit, { original: true })} {ingredientName(i.key, lng, i.name)}
            </Text>
          ))}
          {draft.skipped.length ? <Note tone="warning">{t('import.skipped', { count: draft.skipped.length })}</Note> : null}
          <Button label={t('import.openEditor')} icon="create-outline" onPress={open} testID="import-open" />
        </Card>
      ) : null}
      <Note>{t('import.privacy')}</Note>
    </Screen>
  );
}
