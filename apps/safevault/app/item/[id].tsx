import { Badge, Button, Card, Divider, IconButton, Row, Screen, Stack, Text } from '@factory/design-system';
import { Stack as RouterStack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { FormattedNote } from '@/components/FormattedNote';
import { CategoryDot, useCategoryName, ValueRow } from '@/components/vault';
import { formatCardNumber, isExpired } from '@/features/cards/cards';
import { IDENTITY_FIELDS, MULTILINE_IDENTITY_FIELDS, SENSITIVE_IDENTITY_FIELDS } from '@/features/identity/templates';
import { safeOpenableUrl } from '@/features/search/search';
import { fmt } from '@/i18n';
import { vaultService } from '@/services/context';
import { logEvent } from '@/services/log';
import { useIsPremium } from '@/store/app';
import { markViewed, toggleFavorite, useVault } from '@/store/vault';
import type { AnySecret, CardSecret, IdentitySecret, LoginSecret, NoteSecret } from '@/vault/types';

export default function ItemDetail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useVault((s) => s.items.find((i) => i.id === id));
  const category = useVault((s) => s.categories.find((c) => c.id === item?.meta.categoryId));
  const categoryName = useCategoryName();
  const isPremium = useIsPremium();
  const [secret, setSecret] = useState<AnySecret | null>(null);
  const [failed, setFailed] = useState(false);

  // Decrypt this item's secret only while the screen is open; drop it on unmount.
  useEffect(() => {
    if (!id) return;
    let alive = true;
    vaultService()
      .getSecret(id)
      .then((s) => alive && setSecret(s))
      .catch((e) => {
        logEvent('item_decrypt_failed', e);
        if (alive) setFailed(true);
      });
    void markViewed(id).catch(() => undefined);
    return () => {
      alive = false;
      setSecret(null);
    };
  }, [id]);

  if (!item) return null;

  const remove = () =>
    Alert.alert(t('item.deleteTitle'), t('item.deleteBody', { title: item.meta.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await vaultService().deleteItem(item.id);
          router.back();
        },
      },
    ]);

  const openUrl = (url: string) => {
    const safe = safeOpenableUrl(url);
    if (safe) void Linking.openURL(safe);
  };

  return (
    <Screen edges={[]}>
      <RouterStack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Row gap={0}>
              <IconButton icon={item.meta.favorite ? 'star' : 'star-outline'} label={item.meta.favorite ? t('item.unfavorite') : t('item.favorite')} onPress={() => void toggleFavorite(item.id)} />
              <IconButton icon="create-outline" label={t('common.edit')} onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })} />
            </Row>
          ),
        }}
      />
      <Row gap={3}>
        <CategoryDot color={category?.color ?? '#64748B'} icon={category?.icon ?? 'folder'} size={48} />
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="title" numberOfLines={2}>
            {item.meta.title}
          </Text>
          <Row gap={2} wrap>
            <Badge label={t(`types.${item.type}`)} tone="neutral" />
            <Badge label={categoryName(category)} tone="primary" />
            {item.meta.tags.map((tg) => (
              <Badge key={tg} label={`#${tg}`} tone="neutral" />
            ))}
          </Row>
        </Stack>
      </Row>

      {failed ? <Text tone="danger">{t('item.decryptFailed')}</Text> : null}

      <Card>
        {item.type === 'login' ? (
          <>
            <ValueRow label={t('fields.username')} value={item.meta.username} copyLabel={t('fields.username')} />
            <ValueRow label={t('fields.email')} value={item.meta.email} copyLabel={t('fields.email')} />
            <ValueRow label={t('fields.password')} value={(secret as LoginSecret | null)?.password ?? ''} secret mono copyLabel={t('fields.password')} />
            <ValueRow label={t('fields.url')} value={item.meta.url} copyLabel={t('fields.url')} action={safeOpenableUrl(item.meta.url) ? { icon: 'open-outline', label: t('item.openWebsite'), onPress: () => openUrl(item.meta.url) } : undefined} />
            <ValueRow label={t('fields.description')} value={(secret as LoginSecret | null)?.description ?? ''} />
            <ValueRow label={t('fields.notes')} value={(secret as LoginSecret | null)?.notes ?? ''} secret multiline />
          </>
        ) : null}
        {item.type === 'note' && item.meta.format === 'simple' && secret ? <FormattedNote body={(secret as NoteSecret).body} /> : null}
        {item.type === 'note' ? (
          <ValueRow label={item.meta.format === 'simple' ? t('note.raw') : t('fields.body')} value={(secret as NoteSecret | null)?.body ?? ''} secret={item.meta.format === 'simple'} multiline copyLabel={t('fields.body')} />
        ) : null}
        {item.type === 'card' ? (
          <>
            <ValueRow label={t('fields.cardholder')} value={item.meta.cardholder} copyLabel={t('fields.cardholder')} />
            <ValueRow label={t('fields.cardNumber')} value={formatCardNumber((secret as CardSecret | null)?.number ?? '')} secret mono copyLabel={t('fields.cardNumber')} />
            <ValueRow label={t('fields.expiry')} value={item.meta.expiry} />
            {item.meta.expiry && isExpired(item.meta.expiry, new Date()) ? <Badge label={t('card.expired')} tone="danger" /> : null}
            <ValueRow label={t('fields.notes')} value={(secret as CardSecret | null)?.notes ?? ''} secret multiline />
          </>
        ) : null}
        {item.type === 'identity'
          ? IDENTITY_FIELDS[item.meta.template].map((f) => (
              <ValueRow
                key={f}
                label={t(`identity.fields.${f}`)}
                value={(secret as IdentitySecret | null)?.[f] ?? ''}
                secret={SENSITIVE_IDENTITY_FIELDS.includes(f)}
                multiline={MULTILINE_IDENTITY_FIELDS.includes(f)}
                copyLabel={t(`identity.fields.${f}`)}
              />
            ))
          : null}
      </Card>

      {item.type === 'card' ? <Text variant="caption" tone="subtle">{t('card.disclaimer')}</Text> : null}

      {item.type === 'login' && secret && (secret as LoginSecret).history.length > 0 ? (
        <Card>
          <Text variant="subheading">{t('item.history', { count: (secret as LoginSecret).history.length })}</Text>
          {(secret as LoginSecret).history.slice(0, isPremium ? undefined : 1).map((h, i) => (
            <ValueRow key={`${h.replacedAt}-${i}`} label={t('item.replacedOn', { date: fmt.dateTime(h.replacedAt) })} value={h.password} secret mono copyLabel={t('fields.oldPassword')} />
          ))}
          {!isPremium ? (
            <Button label={t('premium.historyCta')} variant="ghost" size="md" onPress={() => router.push('/paywall')} />
          ) : null}
        </Card>
      ) : null}

      <Divider />
      <Stack gap={1}>
        <Text variant="caption" tone="subtle">
          {t('item.created', { date: fmt.dateTime(item.createdAt) })}
        </Text>
        <Text variant="caption" tone="subtle">
          {t('item.updated', { date: fmt.dateTime(item.updatedAt) })}
        </Text>
        {item.type === 'login' && secret ? (
          <Text variant="caption" tone="subtle">
            {t('item.passwordChanged', { date: fmt.date((secret as LoginSecret).passwordUpdatedAt) })}
          </Text>
        ) : null}
      </Stack>
      <Button label={t('common.delete')} variant="danger" icon="trash" onPress={remove} />
    </Screen>
  );
}
