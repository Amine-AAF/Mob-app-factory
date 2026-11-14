import { router, Stack as RouterStack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { todayKey } from '@/components/forms';
import { ItemPickerSheet } from '@/components/ItemPickerSheet';
import { itemMap, OutfitCollage } from '@/components/OutfitCollage';
import { FREE_LIMITS, PREMIUM_SUGGESTION_RESULTS } from '@/config/limits';
import { repos } from '@/database';
import { seasonForDate } from '@/domain/catalog';
import { isRarelyUsed } from '@/domain/insights';
import { FREE_PRESETS, generateSuggestions, missingForSuggestions, SUGGESTION_PRESETS, type Suggestion, type SuggestionContext, type SuggestionPreset } from '@/domain/suggestions';
import { openPaywall } from '@/features/outfits/limits';
import { useAsync } from '@/hooks/useAsync';
import { useLabels } from '@/hooks/useLabels';
import { recordError } from '@/services/analytics';
import { clock } from '@/services/clock';
import { afterWrite } from '@/services/data';
import { useIsPremium, useSettings } from '@/store/session';
import { Badge, Button, Card, Chip, ChipScroller, ChoiceChips, EmptyState, FadeIn, Icon, IconButton, Loading, Row, Screen, SectionHeader, Stack, SwitchRow, Text, useTheme } from '@/ui';

/** Slot the user should add when nothing can be generated -> category to prefill in the item editor. */
const MISSING_CATEGORY = { top: 'tops', bottom: 'pants', shoes: 'shoes' } as const;

/** Local, rule-based outfit ideas. No ads (creation flow). Never presented as AI. */
export default function SuggestionsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useLabels();
  const isPremium = useIsPremium();
  const settings = useSettings();

  const [preset, setPreset] = useState<SuggestionPreset>('casual');
  const [occasionId, setOccasionId] = useState<string | null>(null);
  const [discover, setDiscover] = useState(false);
  const [includeLaundry, setIncludeLaundry] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [excludeOpen, setExcludeOpen] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1_000_000) + 1);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  const { data } = useAsync(async () => {
    const [items, savedSignatures, feedback] = await Promise.all([repos().wardrobe.list(), repos().outfits.signatures(), repos().settings.feedback()]);
    return { items, savedSignatures, feedback };
  }, []);
  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const map = useMemo(() => itemMap(items), [items]);

  const ctx: SuggestionContext = useMemo(
    () => ({ items, categoryKeyOf: labels.categoryKey, styleKeyOf: labels.styleKey, occasionKeyOf: labels.occasionKey }),
    [items, labels],
  );

  const suggestions: Suggestion[] = useMemo(() => {
    if (!data) return [];
    const today = todayKey();
    return generateSuggestions(ctx, {
      preset,
      season: seasonForDate(clock.now(), settings.hemisphere),
      occasionId: isPremium ? occasionId : null,
      excludedItemIds: isPremium ? excluded : [],
      includeUnavailable: includeLaundry,
      discover: isPremium && discover,
      savedSignatures: data.savedSignatures,
      feedback: data.feedback,
      count: isPremium ? PREMIUM_SUGGESTION_RESULTS : FREE_LIMITS.suggestionResults,
      seed,
      rarelyWornIds: new Set(items.filter((i) => isRarelyUsed(i, today)).map((i) => i.id)),
    });
  }, [data, ctx, preset, settings.hemisphere, isPremium, occasionId, excluded, includeLaundry, discover, seed, items]);
  const visible = suggestions.filter((s) => !hidden.has(s.signature));
  const missing = useMemo(() => missingForSuggestions(ctx), [ctx]);

  const choosePreset = (p: SuggestionPreset) => {
    if (!isPremium && !FREE_PRESETS.includes(p)) return openPaywall('suggestions');
    setPreset(p);
  };
  const premiumOnly = (apply: () => void) => (isPremium ? apply() : openPaywall('suggestions'));

  const rate = (s: Suggestion, rating: 1 | -1) => {
    if (rating < 0) setHidden((h) => new Set(h).add(s.signature));
    else setLiked((l) => new Set(l).add(s.signature));
    repos()
      .settings.rate(s.signature, rating, preset)
      .then(() => afterWrite())
      .catch((e) => {
        recordError(e, 'suggestion_rate');
        Alert.alert(t('common.error'));
      });
  };
  const edit = (s: Suggestion, planDate?: string) =>
    router.push({ pathname: '/outfit/builder', params: { items: JSON.stringify(s.items), name: t(`catalog.preset.${preset}`), ...(planDate ? { planDate } : {}) } });

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('suggestions.title') }} />

      <Card tone="alt">
        <Row gap={2} style={{ alignItems: 'flex-start' }}>
          <Icon name="information-circle-outline" size={18} color={theme.colors.textMuted} />
          <Text variant="bodySmall" tone="muted" style={{ flex: 1 }}>
            {t('suggestions.explainer')}
          </Text>
        </Row>
      </Card>

      <SectionHeader title={t('suggestions.presets')} />
      <ChipScroller>
        {SUGGESTION_PRESETS.map((p) => {
          const locked = !isPremium && !FREE_PRESETS.includes(p);
          return <Chip key={p} label={t(`catalog.preset.${p}`)} selected={preset === p} icon={locked ? 'lock-closed-outline' : undefined} onPress={() => choosePreset(p)} testID={`preset-${p}`} />;
        })}
      </ChipScroller>
      {!isPremium ? (
        <Row gap={2}>
          <Badge label={t('common.premium.badge')} icon="sparkles-outline" tone="accent" />
          <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
            {t('suggestions.premiumHint', { count: PREMIUM_SUGGESTION_RESULTS })}
          </Text>
        </Row>
      ) : null}

      <Card>
        {isPremium ? (
          labels.occasionOptions.length ? <ChoiceChips label={t('suggestions.occasion')} options={labels.occasionOptions} value={occasionId} onChange={setOccasionId} allowNone wrap={false} /> : null
        ) : (
          <Row style={{ justifyContent: 'space-between' }}>
            <Text>{t('suggestions.occasion')}</Text>
            <Button small variant="ghost" icon="lock-closed-outline" label={t('common.premium.badge')} onPress={() => openPaywall('suggestions')} />
          </Row>
        )}
        <SwitchRow title={t('suggestions.discover')} subtitle={isPremium ? t('suggestions.discoverHint') : t('suggestions.premiumOnly')} value={isPremium && discover} onChange={(v) => premiumOnly(() => setDiscover(v))} />
        <SwitchRow title={t('suggestions.includeLaundry')} subtitle={t('suggestions.includeLaundryHint')} value={includeLaundry} onChange={setIncludeLaundry} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Stack gap={0.5} style={{ flex: 1 }}>
            <Text>{t('suggestions.exclude')}</Text>
            <Text variant="bodySmall" tone="subtle">
              {isPremium ? (excluded.length ? t('suggestions.excludedCount', { count: excluded.length }) : t('suggestions.excludeHint')) : t('suggestions.premiumOnly')}
            </Text>
          </Stack>
          <Button small variant="secondary" icon={isPremium ? 'remove-circle-outline' : 'lock-closed-outline'} label={t('suggestions.choose')} onPress={() => premiumOnly(() => setExcludeOpen(true))} />
        </Row>
      </Card>

      <Row style={{ justifyContent: 'space-between' }}>
        <SectionHeader title={t('suggestions.results')} />
        <Button small variant="ghost" icon="shuffle" label={t('suggestions.shuffle')} onPress={() => (setSeed((s) => s + 7919), setHidden(new Set()))} testID="suggestions-shuffle" />
      </Row>

      {!data ? (
        <Loading />
      ) : visible.length === 0 ? (
        missing.length > 0 ? (
          <EmptyState
            icon="shirt-outline"
            title={t('suggestions.missingTitle')}
            message={t('suggestions.missingMessage')}
            action={
              <Stack gap={2} style={{ alignSelf: 'stretch' }}>
                {missing.map((m) => (
                  <Button key={m} variant="secondary" icon="add" label={t('suggestions.addMissing', { slot: t(`catalog.slot.${m}`) })} onPress={() => router.push({ pathname: '/item/edit', params: { categoryKey: MISSING_CATEGORY[m] } })} />
                ))}
              </Stack>
            }
          />
        ) : (
          <EmptyState icon="sparkles-outline" title={t('suggestions.noneTitle')} message={t('suggestions.noneMessage')} action={<Button variant="secondary" icon="shuffle" label={t('suggestions.shuffle')} onPress={() => setSeed((s) => s + 7919)} />} />
        )
      ) : (
        visible.map((s, i) => (
          <FadeIn key={s.signature} delay={i * 40}>
            <Card>
              <OutfitCollage refs={s.items} items={map} height={260} />
              <Row gap={1.5} wrap>
                {s.reasons.map((r) => (
                  <Badge key={r} label={t(`catalog.reason.${r}`)} tone={r === 'liked_before' ? 'success' : 'neutral'} />
                ))}
              </Row>
              <Row gap={1} style={{ justifyContent: 'space-between' }}>
                <Row gap={0}>
                  <IconButton icon={liked.has(s.signature) ? 'thumbs-up' : 'thumbs-up-outline'} tone={liked.has(s.signature) ? 'primary' : 'default'} label={t('suggestions.like')} onPress={() => rate(s, 1)} />
                  <IconButton icon="thumbs-down-outline" label={t('suggestions.dislike')} onPress={() => rate(s, -1)} />
                </Row>
                <Row gap={2}>
                  <Button small variant="secondary" icon="calendar-outline" label={t('suggestions.plan')} onPress={() => edit(s, todayKey())} />
                  <Button small icon="create-outline" label={t('suggestions.editSave')} onPress={() => edit(s)} />
                </Row>
              </Row>
            </Card>
          </FadeIn>
        ))
      )}
      {!isPremium && visible.length > 0 ? (
        <Text variant="caption" tone="subtle" center>
          {t('suggestions.freeCount', { count: FREE_LIMITS.suggestionResults })}
        </Text>
      ) : null}
      <View style={{ height: theme.spacing(2) }} />

      <ItemPickerSheet visible={excludeOpen} onClose={() => setExcludeOpen(false)} items={items} title={t('suggestions.exclude')} multiple selected={excluded} onConfirm={setExcluded} />
    </Screen>
  );
}
