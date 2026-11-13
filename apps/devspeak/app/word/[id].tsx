import { Badge, Button, Card, CodeLabel, EmptyState, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InlineTranslation, LevelBadge, SpeakButton } from '@/components/learning';
import { repos } from '@/database';
import { useAsync } from '@/hooks/useAsync';
import { track } from '@/services/analytics';
import { clock } from '@/services/clock';
import { hasEnglishVoice } from '@/services/speech';
import { useIsPremium, useSession } from '@/store/session';

export default function WordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const isPremium = useIsPremium();
  const [voice, setVoice] = useState(true);
  const { data, loading } = useAsync(async () => ({ word: await repos().content.getWord(id), favorites: await repos().progress.favoriteIds() }), [id]);

  useEffect(() => {
    hasEnglishVoice().then(setVoice).catch(() => setVoice(false));
  }, []);

  if (!loading && !data?.word) return <EmptyState icon="alert-circle-outline" title={t('vocabulary.empty')} />;
  const word = data?.word;
  if (!word) return null;
  const fav = data.favorites.has(word.id);
  const locked = word.premium && !isPremium;

  const toggle = async () => {
    const saved = await repos().progress.toggleFavorite(word.id, clock.now());
    if (saved) track('vocabulary_saved', { word_id: word.id });
    useSession.getState().bump();
  };

  return (
    <>
      <RouterStack.Screen
        options={{
          title: '',
          headerRight: locked
            ? undefined
            : () => <IconButton icon={fav ? 'bookmark' : 'bookmark-outline'} tone="accent" label={fav ? t('vocabulary.unfavorite') : t('vocabulary.favorite')} onPress={toggle} />,
        }}
      />
      <Screen edges={[]}>
        <Row gap={2}>
          <Badge label={t(`categories.${word.category}`)} tone="primary" />
          <LevelBadge level={word.difficulty} />
        </Row>
        <Row>
          <Text variant="display" style={{ flex: 1 }}>
            {word.term}
          </Text>
          {word.pronounceable && voice ? <SpeakButton text={word.term} size={28} label={t('vocabulary.pronounce', { word: word.term })} /> : null}
        </Row>
        {!voice ? (
          <Text variant="caption" tone="warning">
            {t('vocabulary.noVoice')}
          </Text>
        ) : null}
        {locked ? (
          <EmptyState icon="diamond-outline" title={t('vocabulary.premiumWord')} action={<Button label={t('paywall.subscribe')} onPress={() => router.push({ pathname: '/paywall', params: { source: 'word' } })} />} />
        ) : (
          <>
            <InlineTranslation value={word.translation} />
            <Card>
              <CodeLabel>{t('vocabulary.definition')}</CodeLabel>
              <Text>{word.definition}</Text>
            </Card>
            <Card tone="alt">
              <CodeLabel>{t('vocabulary.example')}</CodeLabel>
              <Row style={{ alignItems: 'flex-start' }}>
                <Text style={{ flex: 1, fontStyle: 'italic' }}>{word.example}</Text>
                {voice ? <SpeakButton text={word.example} /> : null}
              </Row>
            </Card>
            <Stack gap={2}>
              <Button label={fav ? t('vocabulary.unfavorite') : t('vocabulary.favorite')} icon={fav ? 'bookmark' : 'bookmark-outline'} variant="secondary" onPress={toggle} testID="toggle-favorite" />
            </Stack>
          </>
        )}
      </Screen>
    </>
  );
}
