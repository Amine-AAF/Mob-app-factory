import { Button, EmptyState, Screen, Stack, Text, useTheme } from '@factory/design-system';
import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, View } from 'react-native';

import { NoteView } from '@/components/NoteView';
import { repos } from '@/database';
import { MAX_REVISIONS } from '@/database/repositories/notes';
import { useAsync } from '@/hooks/useAsync';
import { fmt } from '@/i18n';
import { useSession } from '@/store/session';

export default function NoteHistory() {
  const { t } = useTranslation();
  const theme = useTheme();
  const bump = useSession((s) => s.bump);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [open, setOpen] = useState<string | null>(null);
  const { data: revisions } = useAsync(() => repos().notes.revisions(id), [id]);

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('notes.history') }} />
      <Text variant="bodySmall" tone="muted">
        {t('notes.historyHelp', { count: MAX_REVISIONS })}
      </Text>
      {revisions && revisions.length === 0 ? <EmptyState icon="time-outline" title={t('notes.noHistory')} /> : null}
      <Stack gap={2}>
        {revisions?.map((r) => (
          <View key={r.id} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, padding: 12, gap: 8 }}>
            <Pressable onPress={() => setOpen(open === r.id ? null : r.id)} accessibilityRole="button" accessibilityState={{ expanded: open === r.id }}>
              <Text variant="subheading">{fmt.dateTime(r.createdAt)}</Text>
              <Text variant="bodySmall" tone="muted" numberOfLines={1}>
                {r.title}
              </Text>
            </Pressable>
            {open === r.id ? (
              <>
                <NoteView body={r.body} />
                <Button
                  size="md"
                  variant="secondary"
                  icon="refresh"
                  label={t('notes.restore')}
                  onPress={() =>
                    Alert.alert(t('notes.restoreTitle'), t('notes.restoreBody'), [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('notes.restore'),
                        onPress: async () => {
                          await repos().notes.restoreRevision(r.id);
                          bump();
                          // Open a fresh editor on the restored content.
                          router.replace({ pathname: '/notes/[id]', params: { id } });
                        },
                      },
                    ])
                  }
                />
              </>
            ) : null}
          </View>
        ))}
      </Stack>
    </Screen>
  );
}
