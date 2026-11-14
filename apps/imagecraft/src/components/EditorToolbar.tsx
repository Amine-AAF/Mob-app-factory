import { Icon, IconButton, Row, Text, useTheme, type IconName } from '@factory/design-system';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import type { EditorPanel } from '@/store/editor';

const PANELS: { id: EditorPanel; icon: IconName }[] = [
  { id: 'crop', icon: 'crop-outline' },
  { id: 'adjust', icon: 'options-outline' },
  { id: 'filters', icon: 'color-filter-outline' },
  { id: 'text', icon: 'text-outline' },
  { id: 'watermark', icon: 'water-outline' },
];

/** Panel switcher + undo / redo / reset. Only one panel's options are visible at a time. */
export function EditorToolbar({
  panel,
  onPanel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  locked,
}: {
  panel: EditorPanel;
  onPanel: (p: EditorPanel) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  locked?: Partial<Record<EditorPanel, boolean>>;
}) {
  const t = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View style={{ gap: t.spacing(2) }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={1}>
          <View style={{ opacity: canUndo ? 1 : 0.4 }}>
            <IconButton icon="arrow-undo-outline" label={tr('editor.undo')} onPress={() => canUndo && onUndo()} />
          </View>
          <View style={{ opacity: canRedo ? 1 : 0.4 }}>
            <IconButton icon="arrow-redo-outline" label={tr('editor.redo')} onPress={() => canRedo && onRedo()} />
          </View>
        </Row>
        <IconButton icon="refresh-outline" label={tr('editor.resetAll')} onPress={onReset} />
      </Row>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: t.spacing(2) }} accessibilityRole="tablist">
        {PANELS.map((p) => {
          const active = p.id === panel;
          return (
            <Pressable
              key={p.id}
              onPress={() => onPanel(p.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tr(`editor.panels.${p.id}`)}
              testID={`panel-${p.id}`}
              style={{
                minWidth: 76,
                minHeight: 60,
                paddingHorizontal: 10,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                borderRadius: t.radius.md,
                backgroundColor: active ? t.colors.primarySoft : t.colors.surface,
                borderWidth: 1,
                borderColor: active ? t.colors.primary : t.colors.border,
              }}
            >
              <Icon name={p.icon} size={20} color={active ? t.colors.primary : t.colors.textMuted} />
              <Row gap={1}>
                <Text variant="caption" style={{ color: active ? t.colors.primary : t.colors.text }}>
                  {tr(`editor.panels.${p.id}`)}
                </Text>
                {locked?.[p.id] ? <Icon name="diamond" size={10} color={t.colors.accent} /> : null}
              </Row>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
