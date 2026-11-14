import { Stack as RouterStack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Switch, View } from 'react-native';

import { repos } from '@/database';
import type { TagTable } from '@/database/repositories/taxonomyRepository';
import type { Tag } from '@/domain/types';
import { useAsync } from '@/hooks/useAsync';
import { recordError } from '@/services/analytics';
import { afterWrite } from '@/services/data';
import { Button, Card, Divider, Field, IconButton, Loading, Row, Screen, SectionHeader, Segmented, Sheet, Stack, Text, useTheme } from '@/ui';

export default function TaxonomyScreen() {
  const { t } = useTranslation();
  const [table, setTable] = useState<TagTable>('styles');
  const { data } = useAsync(() => repos().taxonomy.tags(table, true), [table]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<Tag | null>(null);
  const group = table === 'styles' ? 'style' : 'occasion';

  const run = async (context: string, task: () => Promise<unknown>) => {
    try {
      await task();
      afterWrite({ taxonomy: true });
      return true;
    } catch (e) {
      recordError(e, context);
      Alert.alert(t('common.error'));
      return false;
    }
  };

  const add = async () => {
    if (!name.trim()) {
      setError(t('settings.taxonomy.nameRequired'));
      return;
    }
    if (await run('tag_add', () => repos().taxonomy.addTag(table, name))) {
      setName('');
      setError(null);
    }
  };

  const builtin = (data ?? []).filter((x) => x.builtin);
  const custom = (data ?? []).filter((x) => !x.builtin);
  const label = (tag: Tag) => (tag.key ? t(`catalog.${group}.${tag.key}`) : (tag.name ?? ''));

  return (
    <Screen edges={[]}>
      <RouterStack.Screen options={{ title: t('settings.taxonomy.title') }} />
      <Text tone="muted">{t('settings.taxonomy.intro')}</Text>
      <Segmented
        options={[
          { value: 'styles', label: t('settings.taxonomy.styles') },
          { value: 'occasions', label: t('settings.taxonomy.occasions') },
        ]}
        value={table}
        onChange={(v) => {
          setTable(v);
          setError(null);
        }}
      />

      <Row gap={2} style={{ alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Field
            label={table === 'styles' ? t('settings.taxonomy.newStyle') : t('settings.taxonomy.newOccasion')}
            value={name}
            onChangeText={setName}
            maxLength={40}
            error={error}
            onSubmitEditing={() => void add()}
            returnKeyType="done"
          />
        </View>
        <Button small label={t('common.add')} icon="add" onPress={() => void add()} style={{ marginBottom: error ? 22 : 4 }} />
      </Row>

      {!data ? (
        <Loading />
      ) : (
        <>
          <SectionHeader title={t('settings.taxonomy.custom')} />
          {custom.length === 0 ? (
            <Text variant="bodySmall" tone="subtle">
              {t('settings.taxonomy.noCustom')}
            </Text>
          ) : (
            <Card style={{ paddingVertical: 0, gap: 0 }}>
              {custom.map((tag, i) => (
                <Stack key={tag.id} gap={0}>
                  {i > 0 ? <Divider /> : null}
                  <Row style={{ minHeight: 52 }}>
                    <Text style={{ flex: 1 }} tone={tag.archived ? 'subtle' : 'default'}>
                      {tag.archived ? `${label(tag)} · ${t('settings.taxonomy.archived')}` : label(tag)}
                    </Text>
                    <IconButton icon="create-outline" size={18} label={t('settings.taxonomy.rename', { name: label(tag) })} onPress={() => setRenaming(tag)} />
                    <IconButton
                      icon={tag.archived ? 'arrow-undo-outline' : 'archive-outline'}
                      size={18}
                      label={tag.archived ? t('settings.taxonomy.restore', { name: label(tag) }) : t('settings.taxonomy.archive', { name: label(tag) })}
                      onPress={() => void run('tag_archive', () => repos().taxonomy.setTagArchived(table, tag.id, !tag.archived))}
                    />
                  </Row>
                </Stack>
              ))}
            </Card>
          )}

          <SectionHeader title={t('settings.taxonomy.builtin')} />
          <Text variant="caption" tone="subtle">
            {t('settings.taxonomy.builtinHint')}
          </Text>
          <Card style={{ paddingVertical: 0, gap: 0 }}>
            {builtin.map((tag, i) => (
              <Stack key={tag.id} gap={0}>
                {i > 0 ? <Divider /> : null}
                <BuiltinRow label={label(tag)} visible={!tag.archived} onChange={(visible) => void run('tag_hide', () => repos().taxonomy.setTagArchived(table, tag.id, !visible))} />
              </Stack>
            ))}
          </Card>
          <Text variant="caption" tone="subtle">
            {t('settings.taxonomy.archiveHint')}
          </Text>
        </>
      )}

      <RenameSheet
        tag={renaming}
        current={renaming ? label(renaming) : ''}
        onClose={() => setRenaming(null)}
        onSave={async (newName) => {
          const tag = renaming;
          setRenaming(null);
          if (tag) await run('tag_rename', () => repos().taxonomy.renameTag(table, tag.id, newName));
        }}
      />
    </Screen>
  );
}

function BuiltinRow({ label, visible, onChange }: { label: string; visible: boolean; onChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Row style={{ minHeight: 52 }}>
      <Text style={{ flex: 1 }} tone={visible ? 'default' : 'subtle'}>
        {label}
      </Text>
      <Switch
        value={visible}
        onValueChange={onChange}
        accessibilityLabel={t('settings.taxonomy.show', { name: label })}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor={theme.colors.surface}
      />
    </Row>
  );
}

function RenameSheet({ tag, current, onClose, onSave }: { tag: Tag | null; current: string; onClose: () => void; onSave: (name: string) => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState(current);
  const [shownFor, setShownFor] = useState<string | null>(null);
  // Reset the field each time another tag is opened.
  if ((tag?.id ?? null) !== shownFor) {
    setShownFor(tag?.id ?? null);
    setValue(current);
  }
  const valid = value.trim().length > 0;
  return (
    <Sheet visible={!!tag} onClose={onClose} title={t('settings.taxonomy.renameTitle')} footer={<Button label={t('common.save')} disabled={!valid} onPress={() => onSave(value.trim())} />}>
      <Field label={t('settings.taxonomy.name')} value={value} onChangeText={setValue} maxLength={40} autoFocus error={valid ? null : t('settings.taxonomy.nameRequired')} />
    </Sheet>
  );
}
