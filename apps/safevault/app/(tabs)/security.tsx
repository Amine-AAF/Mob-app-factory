import { Button, Card, EmptyState, ProgressBar, Row, Screen, SectionHeader, Stack, Text } from '@factory/design-system';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ItemRow, Notice } from '@/components/vault';
import { healthLevel, issueCount, OLD_AFTER_DAYS } from '@/features/audit/audit';
import { fmt } from '@/i18n';
import { useIsPremium } from '@/store/app';
import { runAudit, useVault } from '@/store/vault';
import type { VaultItem } from '@/vault/types';

function IssueSection({ title, description, ids, byId }: { title: string; description: string; ids: string[]; byId: Map<string, VaultItem> }) {
  const router = useRouter();
  if (ids.length === 0) return null;
  return (
    <Stack gap={1}>
      <SectionHeader title={`${title} (${ids.length})`} />
      <Text variant="bodySmall" tone="muted">
        {description}
      </Text>
      {ids.map((id) => {
        const item = byId.get(id);
        return item ? <ItemRow key={id} item={item} onPress={() => router.push({ pathname: '/item/[id]', params: { id } })} /> : null;
      })}
    </Stack>
  );
}

export default function Security() {
  const { t } = useTranslation();
  const router = useRouter();
  const isPremium = useIsPremium();
  const audit = useVault((s) => s.audit);
  const running = useVault((s) => s.auditRunning);
  const items = useVault((s) => s.items);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const level = healthLevel(audit);

  return (
    <Screen>
      <Text variant="title" accessibilityRole="header">
        {t('security.title')}
      </Text>
      <Text tone="muted">{t('security.subtitle')}</Text>

      {audit && audit.total > 0 ? (
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text variant="subheading">{t('security.score')}</Text>
            <Text variant="title" tone={level === 'good' ? 'success' : level === 'fair' ? 'warning' : 'danger'}>
              {`${audit.score}/100`}
            </Text>
          </Row>
          <ProgressBar progress={audit.score / 100} tone={level === 'good' ? 'success' : 'primary'} label={t('security.score')} />
          <Text variant="bodySmall" tone="muted">
            {t('security.summary', { total: audit.total, issues: issueCount(audit) })}
          </Text>
          <Row gap={4} wrap>
            <Text variant="bodySmall">{t('security.counts.weak', { count: audit.weak.length })}</Text>
            <Text variant="bodySmall">{t('security.counts.reused', { count: audit.reusedGroups.reduce((n, g) => n + g.length, 0) })}</Text>
            <Text variant="bodySmall">{t('security.counts.old', { count: audit.old.length })}</Text>
            <Text variant="bodySmall">{t('security.counts.incomplete', { count: audit.incomplete.length })}</Text>
          </Row>
          <Text variant="caption" tone="subtle">
            {t('security.computedAt', { date: fmt.dateTime(audit.computedAt) })}
          </Text>
        </Card>
      ) : items.some((i) => i.type === 'login') ? null : (
        <EmptyState icon="pulse" title={t('security.empty')} />
      )}

      <Button label={running ? t('security.running') : t('security.run')} icon="refresh" loading={running} variant="secondary" onPress={() => void runAudit()} />

      {audit && isPremium ? (
        <Stack gap={5}>
          <IssueSection title={t('security.sections.weak')} description={t('security.sections.weakBody')} ids={audit.weak} byId={byId} />
          {audit.reusedGroups.map((g, i) => (
            <IssueSection key={i} title={t('security.sections.reused')} description={t('security.sections.reusedBody')} ids={g} byId={byId} />
          ))}
          <IssueSection title={t('security.sections.old')} description={t('security.sections.oldBody', { days: OLD_AFTER_DAYS })} ids={audit.old} byId={byId} />
          <IssueSection title={t('security.sections.incomplete')} description={t('security.sections.incompleteBody')} ids={audit.incomplete} byId={byId} />
        </Stack>
      ) : audit && audit.total > 0 ? (
        <Notice tone="primary" icon="sparkles" title={t('premium.auditTitle')}>
          <Stack gap={2}>
            <Text variant="bodySmall">{t('premium.auditBody')}</Text>
            <Button label={t('premium.cta')} size="md" onPress={() => router.push('/paywall')} />
          </Stack>
        </Notice>
      ) : null}

      <Notice tone="warning" icon="information-circle" title={t('security.limitsTitle')}>
        {t('security.limitsBody')}
      </Notice>
    </Screen>
  );
}
