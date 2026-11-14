import { Icon, Row, Text, useTheme, type IconName } from '@factory/design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { maskCard } from '@/features/cards/cards';
import type { StrengthScore } from '@/features/generator/strength';
import { hostOf } from '@/features/search/search';
import { useToast } from '@/hooks/useToast';
import { copySecret } from '@/services/clipboard';
import { useApp } from '@/store/app';
import type { Category, EntryType, VaultItem } from '@/vault/types';

export const TYPE_ICONS: Record<EntryType, IconName> = { login: 'key', note: 'document-lock', card: 'card', identity: 'id-card' };

export const MASK = '••••••••••';

/** Category display name: user name if set, else the translated built-in name. */
export function useCategoryName() {
  const { t } = useTranslation();
  return (c: Category | undefined) => (c ? c.name || (c.builtin ? t(`categories.builtin.${c.builtin}`) : '') : t('categories.builtin.other'));
}

export function CategoryDot({ color, icon, size = 36 }: { color: string; icon: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 3, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon as IconName} size={size * 0.5} color="#FFFFFF" />
    </View>
  );
}

export function itemSubtitle(item: VaultItem, t: (k: string) => string): string {
  switch (item.type) {
    case 'login':
      return item.meta.username || item.meta.email || hostOf(item.meta.url) || t('types.login');
    case 'card':
      return maskCard(item.meta.last4);
    case 'identity':
      return t(`identity.templates.${item.meta.template}`);
    default:
      return t('types.note');
  }
}

/** One vault entry in a list. Shows no secret, ever. */
export function ItemRow({ item, category, onPress, onToggleFavorite }: { item: VaultItem; category?: Category; onPress: () => void; onToggleFavorite?: () => void }) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const subtitle = itemSubtitle(item, tr);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.meta.title}, ${tr(`types.${item.type}`)}, ${subtitle}`}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, paddingHorizontal: 4, borderRadius: t.radius.md, backgroundColor: pressed ? t.colors.surfaceAlt : 'transparent' })}
    >
      <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: category ? category.color : t.colors.primarySoft }}>
        <Icon name={TYPE_ICONS[item.type]} size={20} color={category ? '#FFFFFF' : t.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="subheading" numberOfLines={1}>
          {item.meta.title}
        </Text>
        <Text variant="bodySmall" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} hitSlop={10} accessibilityRole="button" accessibilityLabel={item.meta.favorite ? tr('item.unfavorite') : tr('item.favorite')} style={{ padding: 8 }}>
          <Icon name={item.meta.favorite ? 'star' : 'star-outline'} size={20} color={item.meta.favorite ? t.colors.warning : t.colors.textSubtle} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/** Copies a secret with auto-clear and shows a toast that never contains the value. */
export function useSecureCopy() {
  const { t } = useTranslation();
  const toast = useToast();
  const seconds = useApp((s) => s.settings.clipboardClearSeconds);
  return async (value: string, what: string) => {
    if (!value) return;
    await copySecret(value, seconds);
    toast.show(seconds > 0 ? t('copy.copiedClears', { what, seconds }) : t('copy.copied', { what }));
  };
}

/**
 * A labelled value row. Secret values are masked until revealed; revealing auto-hides after
 * 30 seconds. Copy works without revealing.
 */
export function ValueRow({
  label,
  value,
  secret,
  mono,
  copyLabel,
  multiline,
  onReveal,
  action,
}: {
  label: string;
  value: string;
  secret?: boolean;
  mono?: boolean;
  copyLabel?: string;
  multiline?: boolean;
  onReveal?: () => void;
  action?: { icon: IconName; label: string; onPress: () => void };
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  const copy = useSecureCopy();
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), 30_000);
    return () => clearTimeout(timer);
  }, [revealed]);
  if (!value) return null;
  const shown = secret && !revealed ? MASK : value;
  return (
    <View style={{ paddingVertical: 10, gap: 4 }}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Row gap={1} style={{ alignItems: multiline ? 'flex-start' : 'center' }}>
        <Text
          variant={mono || (secret && revealed) ? 'mono' : 'body'}
          style={{ flex: 1, fontSize: mono || secret ? 16 : undefined, letterSpacing: secret && !revealed ? 2 : 0 }}
          selectable={!secret}
          numberOfLines={multiline ? undefined : 2}
          accessibilityLabel={secret && !revealed ? tr('item.hiddenValue', { label }) : `${label}: ${value}`}
        >
          {shown}
        </Text>
        {secret ? (
          <Pressable
            onPress={() => {
              setRevealed((r) => !r);
              if (!revealed) onReveal?.();
            }}
            accessibilityRole="button"
            accessibilityLabel={revealed ? tr('common.hide') : tr('common.show')}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} size={20} color={t.colors.textMuted} />
          </Pressable>
        ) : null}
        {action ? (
          <Pressable onPress={action.onPress} accessibilityRole="button" accessibilityLabel={action.label} hitSlop={8} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={action.icon} size={20} color={t.colors.textMuted} />
          </Pressable>
        ) : null}
        {copyLabel ? (
          <Pressable
            onPress={() => void copy(value, copyLabel)}
            accessibilityRole="button"
            accessibilityLabel={tr('copy.action', { what: copyLabel })}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="copy-outline" size={20} color={t.colors.primary} />
          </Pressable>
        ) : null}
      </Row>
    </View>
  );
}

export function StrengthMeter({ score, label, detail }: { score: StrengthScore; label: string; detail?: string }) {
  const t = useTheme();
  const colors = [t.colors.danger, t.colors.danger, t.colors.warning, t.colors.success, t.colors.success];
  return (
    <View style={{ gap: 6 }} accessible accessibilityLabel={detail ? `${label}. ${detail}` : label}>
      <Row gap={1}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < Math.max(1, score) ? colors[score] : t.colors.surfaceAlt }} />
        ))}
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="caption" style={{ color: colors[score], fontWeight: '700' }}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" tone="subtle">
            {detail}
          </Text>
        ) : null}
      </Row>
    </View>
  );
}

export function Notice({ tone = 'warning', icon, title, children }: { tone?: 'warning' | 'danger' | 'primary' | 'success'; icon?: IconName; title?: string; children?: React.ReactNode }) {
  const t = useTheme();
  const bg = { warning: t.colors.warningSoft, danger: t.colors.dangerSoft, primary: t.colors.primarySoft, success: t.colors.successSoft }[tone];
  const fg = { warning: t.colors.warning, danger: t.colors.danger, primary: t.colors.primary, success: t.colors.success }[tone];
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: t.radius.md, backgroundColor: bg }} accessibilityRole="alert">
      <Icon name={icon ?? (tone === 'success' ? 'checkmark-circle' : tone === 'primary' ? 'information-circle' : 'warning')} size={22} color={fg} />
      <View style={{ flex: 1, gap: 4 }}>
        {title ? (
          <Text variant="subheading" style={{ color: fg }}>
            {title}
          </Text>
        ) : null}
        {typeof children === 'string' ? (
          <Text variant="bodySmall" style={{ color: t.colors.text }}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
