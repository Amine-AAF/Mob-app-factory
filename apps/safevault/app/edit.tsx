import { Button, Chip, OptionCard, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { Field, SecretInput, Toggle } from '@/components/inputs';
import { CategoryDot, Notice, StrengthMeter, TYPE_ICONS, useCategoryName } from '@/components/vault';
import { detectBrand, last4Of, looksLikeCvvOrPin, luhnValid, normalizeExpiry } from '@/features/cards/cards';
import { generate } from '@/features/generator/generator';
import { takeGeneratedPassword } from '@/features/generator/handoff';
import { estimateStrength } from '@/features/generator/strength';
import { IDENTITY_FIELDS, MULTILINE_IDENTITY_FIELDS, TEMPLATE_ICONS } from '@/features/identity/templates';
import { FREE_LIMITS, remaining } from '@/features/monetization/plan';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { useApp, useIsPremium } from '@/store/app';
import { saveItem, useVault } from '@/store/vault';
import { emptyMeta, emptySecret, isEntryType } from '@/vault/schema';
import {
  DEFAULT_CATEGORY_ID,
  ENTRY_TYPES,
  IDENTITY_TEMPLATES,
  type AnyMeta,
  type AnySecret,
  type CardMeta,
  type CardSecret,
  type EntryType,
  type IdentityMeta,
  type IdentitySecret,
  type LoginMeta,
  type LoginSecret,
  type NoteMeta,
  type NoteSecret,
} from '@/vault/types';

function TypePicker({ onPick }: { onPick: (t: EntryType) => void }) {
  const { t } = useTranslation();
  const items = useVault((s) => s.items);
  const isPremium = useIsPremium();
  return (
    <Screen edges={[]}>
      <Text variant="title">{t('edit.chooseType')}</Text>
      {ENTRY_TYPES.map((k) => {
        const left = remaining(k, items, isPremium);
        return (
          <OptionCard
            key={k}
            title={t(`types.${k}`)}
            subtitle={left === null ? t(`edit.typeHint.${k}`) : t('edit.remaining', { count: left, max: FREE_LIMITS[k] })}
            icon={TYPE_ICONS[k]}
            selected={false}
            onPress={() => onPick(k)}
            testID={`pick-${k}`}
          />
        );
      })}
    </Screen>
  );
}

export default function EditItem() {
  const params = useLocalSearchParams<{ id?: string; type?: string; categoryId?: string }>();
  const existing = useVault((s) => (params.id ? s.items.find((i) => i.id === params.id) : undefined));
  const [type, setType] = useState<EntryType | null>(existing?.type ?? (isEntryType(params.type) ? params.type : null));
  if (!type) return <TypePicker onPick={setType} />;
  return <Editor key={type} type={type} id={existing?.id} initialCategory={params.categoryId} />;
}

function Editor({ type, id, initialCategory }: { type: EntryType; id?: string; initialCategory?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const existing = useVault((s) => (id ? s.items.find((i) => i.id === id) : undefined));
  const categories = useVault((s) => s.categories);
  const categoryName = useCategoryName();
  const generatorOptions = useApp((s) => s.settings.generator);
  const [meta, setMeta] = useState<AnyMeta>(() => existing?.meta ?? emptyMeta(type, initialCategory ?? DEFAULT_CATEGORY_ID));
  const [secret, setSecret] = useState<AnySecret | null>(() => {
    if (id) return null;
    const fresh = emptySecret(type, Date.now());
    // A password chosen in the Generator tab ("Save in a new login"), handed off in memory once.
    const generated = type === 'login' ? takeGeneratedPassword() : null;
    return generated ? ({ ...(fresh as LoginSecret), password: generated } as AnySecret) : fresh;
  });
  const [tagsText, setTagsText] = useState((existing?.meta.tags ?? []).join(', '));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (id) {
      vaultService()
        .getSecret(id)
        .then((s) => alive && setSecret(s))
        .catch((e) => {
          logEvent('edit_decrypt_failed', e);
          if (alive) setError(t('item.decryptFailed'));
        });
    }
    return () => {
      alive = false;
    };
  }, [id, t]);

  const m = <T extends AnyMeta>() => meta as T;
  const s = <T extends AnySecret>() => secret as T;
  const patchMeta = (p: Partial<AnyMeta> & Record<string, unknown>) => setMeta((cur) => ({ ...cur, ...p }) as AnyMeta);
  const patchSecret = (p: Record<string, unknown>) => setSecret((cur) => ({ ...(cur as AnySecret), ...p }) as AnySecret);

  const strength = useMemo(() => (type === 'login' && secret ? estimateStrength((secret as LoginSecret).password) : null), [type, secret]);
  const cardNumber = type === 'card' && secret ? (secret as CardSecret).number : '';
  const cvvWarning = (type === 'card' && secret && looksLikeCvvOrPin((secret as CardSecret).notes)) || false;

  if (!secret) return null;

  const save = async () => {
    setError(null);
    if (!meta.title.trim()) return setError(t('edit.titleRequired'));
    if (cvvWarning) return setError(t('card.noCvv'));
    setBusy(true);
    try {
      let nextMeta = { ...meta, tags: tagsText.split(',').map((x) => x.trim()).filter(Boolean) } as AnyMeta;
      if (type === 'card') {
        const num = (secret as CardSecret).number;
        nextMeta = { ...(nextMeta as CardMeta), last4: last4Of(num), brand: detectBrand(num), expiry: normalizeExpiry((nextMeta as CardMeta).expiry) || '' };
      }
      const r = await saveItem({ id, type, meta: nextMeta, secret } as Parameters<typeof saveItem>[0]);
      if (r === 'limit') {
        router.push('/paywall');
        return;
      }
      setSecret(null);
      if (id) router.back();
      else router.replace({ pathname: '/item/[id]', params: { id: r.id } });
    } catch (e) {
      logEvent('save_failed', e);
      setError(t('errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={[]} footer={<Button label={t('common.save')} onPress={save} loading={busy} testID="edit-save" />}>
      <RouterStack.Screen options={{ title: id ? t('edit.editTitle', { type: t(`types.${type}`) }) : t('edit.newTitle', { type: t(`types.${type}`) }) }} />

      {type === 'identity' ? (
        <Row gap={2} wrap>
          {IDENTITY_TEMPLATES.map((tpl) => (
            <Chip key={tpl} label={t(`identity.templates.${tpl}`)} icon={TEMPLATE_ICONS[tpl] as never} selected={m<IdentityMeta>().template === tpl} onPress={() => patchMeta({ template: tpl })} />
          ))}
        </Row>
      ) : null}

      <Field label={type === 'card' ? t('fields.cardName') : type === 'login' ? t('fields.service') : t('fields.title')} value={meta.title} onChangeText={(v) => patchMeta({ title: v })} testID="edit-title" maxLength={200} />

      {type === 'login' ? (
        <>
          <Field label={t('fields.url')} value={m<LoginMeta>().url} onChangeText={(v) => patchMeta({ url: v })} autoCapitalize="none" keyboardType="url" placeholder="https://" />
          <Field label={t('fields.username')} value={m<LoginMeta>().username} onChangeText={(v) => patchMeta({ username: v })} autoCapitalize="none" />
          <Field label={t('fields.email')} value={m<LoginMeta>().email} onChangeText={(v) => patchMeta({ email: v })} autoCapitalize="none" keyboardType="email-address" />
          <SecretInput
            label={t('fields.password')}
            value={s<LoginSecret>().password}
            onChangeText={(v) => patchSecret({ password: v })}
            testID="edit-password"
            right={
              <Pressable onPress={() => patchSecret({ password: generate(generatorOptions) })} accessibilityRole="button" accessibilityLabel={t('generator.generate')} style={{ paddingHorizontal: 8, height: 48, justifyContent: 'center' }}>
                <Text variant="bodySmall" tone="primary" style={{ fontWeight: '700' }}>
                  {t('edit.generate')}
                </Text>
              </Pressable>
            }
          />
          {strength && s<LoginSecret>().password ? <StrengthMeter score={strength.score} label={t(`strength.score.${strength.score}`)} detail={t('strength.bits', { bits: strength.entropyBits })} /> : null}
          <Field label={t('fields.description')} value={s<LoginSecret>().description} onChangeText={(v) => patchSecret({ description: v })} />
        </>
      ) : null}

      {type === 'note' ? (
        <>
          <Field label={t('fields.body')} value={s<NoteSecret>().body} onChangeText={(v) => patchSecret({ body: v })} multiline />
          <Toggle label={t('note.simpleFormat')} description={t('note.simpleFormatHint')} value={m<NoteMeta>().format === 'simple'} onChange={(v) => patchMeta({ format: v ? 'simple' : 'plain' })} />
        </>
      ) : null}

      {type === 'card' ? (
        <>
          <Notice tone="primary" icon="information-circle">
            {t('card.disclaimer')}
          </Notice>
          <Field label={t('fields.cardholder')} value={m<CardMeta>().cardholder} onChangeText={(v) => patchMeta({ cardholder: v })} autoCapitalize="characters" />
          <SecretInput
            label={t('fields.cardNumber')}
            value={cardNumber}
            onChangeText={(v) => patchSecret({ number: v.replace(/\D/g, '').slice(0, 19) })}
            keyboardType="number-pad"
            hint={cardNumber.length >= 12 && !luhnValid(cardNumber) ? t('card.luhnWarning') : undefined}
          />
          <Field label={t('fields.expiry')} value={m<CardMeta>().expiry} onChangeText={(v) => patchMeta({ expiry: v.replace(/[^\d/]/g, '').slice(0, 5) })} keyboardType="number-pad" placeholder="MM/YY" />
          <Text variant="caption" tone="subtle">
            {t('card.noCvvHint')}
          </Text>
        </>
      ) : null}

      {type === 'identity'
        ? IDENTITY_FIELDS[m<IdentityMeta>().template].map((f) => (
            <Field key={f} label={t(`identity.fields.${f}`)} value={s<IdentitySecret>()[f]} onChangeText={(v) => patchSecret({ [f]: v })} multiline={MULTILINE_IDENTITY_FIELDS.includes(f)} />
          ))
        : null}

      <Stack gap={2}>
        <Text variant="caption" tone="muted">
          {t('fields.category')}
        </Text>
        <Row gap={2} wrap>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => patchMeta({ categoryId: c.id })}
              accessibilityRole="radio"
              accessibilityState={{ checked: meta.categoryId === c.id }}
              accessibilityLabel={categoryName(c)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 12, paddingLeft: 4, minHeight: 40, borderRadius: 20, borderWidth: 1.5, borderColor: meta.categoryId === c.id ? c.color : 'transparent' }}
            >
              <CategoryDot color={c.color} icon={c.icon} size={28} />
              <Text variant="bodySmall">{categoryName(c)}</Text>
            </Pressable>
          ))}
        </Row>
      </Stack>
      <Field label={t('fields.tags')} value={tagsText} onChangeText={setTagsText} hint={t('edit.tagsHint')} autoCapitalize="none" />
      {type === 'login' || type === 'card' ? (
        <Field label={t('fields.notes')} value={(secret as LoginSecret | CardSecret).notes} onChangeText={(v) => patchSecret({ notes: v })} multiline />
      ) : null}
      <Toggle label={t('item.favorite')} value={meta.favorite} onChange={(v) => patchMeta({ favorite: v })} />
      {cvvWarning ? <Notice tone="danger">{t('card.noCvv')}</Notice> : null}
      {error ? <Notice tone="danger">{error}</Notice> : null}
    </Screen>
  );
}
