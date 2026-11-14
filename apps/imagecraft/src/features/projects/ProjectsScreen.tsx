import { Badge, Button, Card, Row, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, View } from 'react-native';

import { ErrorNotice } from '@/components/common';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/monetization';
import { repos } from '@/database';
import type { Project } from '@/database/repositories/projectsRepository';
import { useOpenTool } from '@/features/navigation';
import { fmt } from '@/i18n';
import { recordError, track } from '@/services/analytics';
import { processingEnv } from '@/services/env';
import { toErrorCode, type ProcessingErrorCode } from '@/services/files/errors';
import { mimeTypeOf } from '@/services/files/formats';
import { inspectImage } from '@/services/image/engine';
import { shareImage } from '@/services/share';
import { useEditor } from '@/store/editor';
import { useSession } from '@/store/session';

import { canReopen, clearAllProjects, deleteProject } from './projectsService';

/** Local history: recent results, the operations applied, re-open, share, delete. */
export default function ProjectsScreen() {
  const { t } = useTranslation();
  const dataVersion = useSession((s) => s.dataVersion);
  const [items, setItems] = useState<(Project & { reopenable: boolean; exists: boolean })[] | null>(null);
  const [error, setError] = useState<ProcessingErrorCode | null>(null);
  const { importAndEdit } = useOpenTool('projects');

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await repos().projects.list();
      const fs = processingEnv().fs;
      const enriched = await Promise.all(list.map(async (p) => ({ ...p, reopenable: await canReopen(p), exists: p.outputUri ? await fs.exists(p.outputUri) : false })));
      if (alive) setItems(enriched);
    })().catch((e) => recordError(e, 'projects_load'));
    return () => {
      alive = false;
    };
  }, [dataVersion]);

  const reopen = async (p: Project) => {
    setError(null);
    try {
      if (!p.sourceUri || !p.editState) return;
      const source = await inspectImage(processingEnv().fs, p.sourceUri, p.sourceName ?? p.title);
      useEditor.getState().open(source, { editState: p.editState, projectId: p.id, panel: 'adjust' });
      track('editor_opened', { entry: 'project' });
      router.navigate('/(tabs)/edit');
    } catch (e) {
      setError(toErrorCode(e));
    }
  };

  const share = async (p: Project) => {
    if (!p.outputUri || !p.outputFormat) return;
    try {
      await shareImage(p.outputUri, mimeTypeOf(p.outputFormat), t('export.shareTitle'));
    } catch (e) {
      setError(toErrorCode(e));
    }
  };

  const confirmDelete = (p: Project) =>
    Alert.alert(t('projects.deleteTitle'), t('projects.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void deleteProject(p.id).catch((e) => setError(toErrorCode(e))) },
    ]);

  const confirmClear = () =>
    Alert.alert(t('projects.clearTitle'), t('projects.clearMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('projects.clearConfirm'), style: 'destructive', onPress: () => void clearAllProjects().catch((e) => setError(toErrorCode(e))) },
    ]);

  return (
    <Screen testID="projects-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Text variant="title" accessibilityRole="header">
          {t('tabs.projects')}
        </Text>
        {items && items.length > 0 ? <Button size="md" variant="ghost" icon="trash-outline" label={t('projects.clear')} onPress={confirmClear} testID="clear-history" /> : null}
      </Row>
      <Text variant="caption" tone="muted">
        {t('projects.privacyNote')}
      </Text>
      {error ? <ErrorNotice code={error} /> : null}
      {items && items.length === 0 ? <EmptyState icon="albums-outline" title={t('projects.emptyTitle')} message={t('projects.emptyMessage')} actionLabel={t('home.import')} onAction={() => void importAndEdit()} /> : null}
      {items?.map((p) => (
        <ProjectRow key={p.id} project={p} onReopen={p.reopenable ? () => void reopen(p) : undefined} onShare={p.exists ? () => void share(p) : undefined} onDelete={() => confirmDelete(p)} missing={!p.exists} />
      ))}
      <AdBanner />
    </Screen>
  );
}

function ProjectRow({ project: p, onReopen, onShare, onDelete, missing }: { project: Project; onReopen?: () => void; onShare?: () => void; onDelete: () => void; missing: boolean }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Card testID={`project-${p.id}`}>
      <Row gap={3} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 72, height: 72, borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt }}>
          {p.outputUri && !missing ? <Image source={{ uri: p.outputUri }} resizeMethod="resize" style={{ flex: 1 }} accessibilityIgnoresInvertColors /> : null}
        </View>
        <Stack gap={1} style={{ flex: 1 }}>
          <Text variant="bodySmall" style={{ fontWeight: '700' }} numberOfLines={1}>
            {p.title}
          </Text>
          <Text variant="caption" tone="muted">
            {`${t(`projects.kinds.${p.kind}`)} · ${fmt.date(new Date(p.updatedAt))}`}
          </Text>
          <Row gap={1} wrap>
            {p.outputFormat ? <Badge label={t(`format.names.${p.outputFormat}`)} tone="primary" /> : null}
            {p.outputBytes ? <Badge label={fmt.size(p.outputBytes)} tone="neutral" /> : null}
            {p.outputWidth && p.outputHeight ? <Badge label={fmt.dims(p.outputWidth, p.outputHeight)} tone="neutral" /> : null}
            {p.itemCount > 1 ? <Badge label={t('projects.items', { count: p.itemCount })} tone="neutral" /> : null}
          </Row>
          {p.operations.length ? (
            <Text variant="caption" tone="muted" numberOfLines={2}>
              {p.operations.map((o) => t(`operations.${o}`)).join(' · ')}
            </Text>
          ) : null}
          {missing ? (
            <Text variant="caption" tone="warning">
              {t('projects.fileMissing')}
            </Text>
          ) : null}
        </Stack>
      </Row>
      <Row gap={2} wrap>
        {onReopen ? <Button size="md" variant="secondary" icon="brush-outline" label={t('projects.reopen')} onPress={onReopen} /> : null}
        {onShare ? <Button size="md" variant="secondary" icon="share-social-outline" label={t('export.share')} onPress={onShare} /> : null}
        <Button size="md" variant="ghost" icon="trash-outline" label={t('common.delete')} onPress={onDelete} />
      </Row>
    </Card>
  );
}
