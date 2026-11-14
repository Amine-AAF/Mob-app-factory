import { Button, EmptyState as BaseEmptyState, type IconName } from '@factory/design-system';

/** Design-system empty state with an optional primary action (e.g. "Import image"). */
export function EmptyState({ icon, title, message, actionLabel, onAction, testID }: { icon: IconName; title: string; message?: string; actionLabel?: string; onAction?: () => void; testID?: string }) {
  return (
    <BaseEmptyState
      icon={icon}
      title={title}
      message={message}
      action={actionLabel && onAction ? <Button label={actionLabel} icon="images-outline" onPress={onAction} size="md" testID={testID} /> : undefined}
    />
  );
}
