import { Button, Row, Screen } from '@factory/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

import { ScreenHeader } from './ui';

/** Standard edit screen: back header, scrollable fields, Save (and optional Delete) in a footer. No ads. */
export function FormScreen({ title, children, onSave, saving, onDelete, deleteMessage, saveLabel, canSave = true }: { title: string; children: ReactNode; onSave: () => void; saving?: boolean; onDelete?: () => void; deleteMessage?: string; saveLabel?: string; canSave?: boolean }) {
  const { t } = useTranslation();
  const confirmDelete = () =>
    Alert.alert(t('common.deleteTitle'), deleteMessage ?? t('common.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: onDelete },
    ]);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        footer={
          <Row gap={3}>
            {onDelete ? (
              <View style={{ flex: 1 }}>
                <Button label={t('common.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} testID="form-delete" />
              </View>
            ) : null}
            <View style={{ flex: 2 }}>
              <Button label={saveLabel ?? t('common.save')} onPress={onSave} loading={saving} disabled={!canSave} testID="form-save" />
            </View>
          </Row>
        }
      >
        <ScreenHeader title={title} back />
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** Empty string → null, trimmed. */
export const orNull = (s: string): string | null => (s.trim() ? s.trim() : null);

/** Parses a positive integer field ("12" → 12, "" → null). */
export const intOrNull = (s: string): number | null => {
  const n = Number.parseInt(s.replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : null;
};
