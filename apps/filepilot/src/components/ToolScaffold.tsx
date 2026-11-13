import { Button, Screen } from '@factory/design-system';
import type { ReactNode } from 'react';

import type { OperationPhase } from '@/hooks/useOperation';

import { OperationFeedback, ProcessingView } from './processing';

/**
 * Common layout of every tool: content + one primary action in the footer.
 * While running, the whole screen becomes the processing view (no other control,
 * no ads, cancel always available).
 */
export function ToolScaffold({
  state,
  processingTitle,
  unit,
  onCancel,
  actionLabel,
  actionIcon,
  onAction,
  actionDisabled,
  onRetry,
  children,
  testID,
}: {
  state: OperationPhase;
  processingTitle: string;
  unit?: 'step' | 'file' | 'page';
  onCancel: () => void;
  actionLabel?: string;
  actionIcon?: Parameters<typeof Button>[0]['icon'];
  onAction?: () => void;
  actionDisabled?: boolean;
  onRetry?: () => void;
  children: ReactNode;
  testID?: string;
}) {
  if (state.phase === 'running') {
    return <ProcessingView title={processingTitle} done={state.done} total={state.total} onCancel={onCancel} {...(unit ? { unit } : {})} />;
  }
  return (
    <Screen
      edges={[]}
      testID={testID}
      footer={actionLabel && onAction ? <Button label={actionLabel} icon={actionIcon} onPress={onAction} disabled={actionDisabled} testID="tool-action" /> : undefined}
    >
      <OperationFeedback state={state} {...(onRetry ? { onRetry } : {})} />
      {children}
    </Screen>
  );
}
