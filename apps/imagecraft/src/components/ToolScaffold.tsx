import { Button, Screen, Stack, Text } from '@factory/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { JobState } from '@/hooks/useJob';
import type { ProcessingErrorCode } from '@/services/files/errors';
import type { SourceImage } from '@/types/image';

import { ErrorNotice, SourceSummary } from './common';
import { EmptyState } from './EmptyState';
import { ExportDialog, type ExportedFile } from './ExportDialog';
import { ProcessingProgress } from './ProcessingProgress';

/**
 * Common frame of single-image tools: import → options → process → result sheet.
 * No ad placement exists in this scaffold by design.
 */
export function ToolScaffold({
  tool,
  source,
  onChoose,
  choosing,
  importError,
  children,
  actionLabel,
  onAction,
  actionDisabled,
  job,
  onCancel,
  onRetry,
  result,
  onDone,
  notice,
  footer,
}: {
  tool: string;
  source: SourceImage | null;
  onChoose: () => void;
  choosing: boolean;
  importError: ProcessingErrorCode | null;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  job: JobState<unknown>;
  onCancel: () => void;
  onRetry: () => void;
  result: { files: ExportedFile[]; inputBytes: number | null } | null;
  onDone: () => void;
  notice?: string | null;
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <Screen edges={[]} testID={`tool-${tool}`}>
      {!source ? (
        <>
          <EmptyState icon="images-outline" title={t(`tools.${tool}.emptyTitle`)} message={t(`tools.${tool}.description`)} actionLabel={choosing ? t('home.importing') : t('home.import')} onAction={onChoose} testID="tool-import" />
          {importError ? <ErrorNotice code={importError} /> : null}
        </>
      ) : (
        <>
          <SourceSummary source={source} action={<Button size="md" variant="ghost" icon="swap-horizontal-outline" label={t('common.change')} onPress={onChoose} disabled={job.status === 'running'} />} />
          {importError ? <ErrorNotice code={importError} /> : null}
          {children}
          {job.status === 'running' ? <ProcessingProgress done={job.done} total={job.total} onCancel={onCancel} /> : null}
          {job.status === 'error' ? <ErrorNotice code={job.code} onRetry={onRetry} /> : null}
          {job.status === 'cancelled' ? (
            <Text variant="bodySmall" tone="muted">
              {t('processing.cancelled')}
            </Text>
          ) : null}
          <Stack gap={2}>
            <Button label={actionLabel} icon="flash-outline" onPress={onAction} disabled={actionDisabled || job.status === 'running'} testID="tool-action" />
            <Text variant="caption" tone="muted" center>
              {t('editor.originalSafe')}
            </Text>
          </Stack>
          {footer}
        </>
      )}
      {result ? <ExportDialog visible files={result.files} inputBytes={result.inputBytes} tool={tool} onDone={onDone} notice={notice} /> : null}
    </Screen>
  );
}
