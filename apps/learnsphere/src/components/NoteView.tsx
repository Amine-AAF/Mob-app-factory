import { Stack, Text, useTheme } from '@factory/design-system';
import { View } from 'react-native';

import { parseNote, type InlineSpan } from '@/features/notes/format';
import { READING_SCALE, usePreferences } from '@/store/preferences';

/** Renders a note with comfortable reading typography (line height, size preference). */
export function NoteView({ body, testID }: { body: string; testID?: string }) {
  const t = useTheme();
  const scale = READING_SCALE[usePreferences((s) => s.readingSize)];
  const blocks = parseNote(body);
  const base = 17 * scale;
  const spans = (items: InlineSpan[]) =>
    items.map((s, i) => (
      <Text
        key={i}
        style={[
          { fontSize: base, lineHeight: base * 1.55 },
          s.bold && { fontWeight: '700' },
          s.highlight && { backgroundColor: t.scheme === 'dark' ? '#5C4A12' : '#FFF1B8', color: t.colors.text },
        ]}
      >
        {s.text}
      </Text>
    ));
  return (
    <Stack gap={2} testID={testID}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return (
              <Text key={i} variant="title" accessibilityRole="header" style={{ fontSize: 24 * scale, lineHeight: 30 * scale, marginTop: i ? 8 : 0 }}>
                {b.spans.map((s) => s.text).join('')}
              </Text>
            );
          case 'subheading':
            return (
              <Text key={i} variant="heading" accessibilityRole="header" style={{ fontSize: 19 * scale, lineHeight: 26 * scale, marginTop: 4 }}>
                {b.spans.map((s) => s.text).join('')}
              </Text>
            );
          case 'bullet':
          case 'numbered':
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 8, paddingLeft: 4 }}>
                <Text style={{ fontSize: base, lineHeight: base * 1.55, color: t.colors.primary, fontWeight: '700', minWidth: 18 }}>{b.type === 'bullet' ? '•' : `${b.index}.`}</Text>
                <Text style={{ flex: 1 }}>{spans(b.spans)}</Text>
              </View>
            );
          case 'quote':
            return (
              <View key={i} style={{ borderLeftWidth: 4, borderLeftColor: t.colors.accent, backgroundColor: t.colors.accentSoft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
                <Text>{spans(b.spans)}</Text>
              </View>
            );
          case 'spacer':
            return <View key={i} style={{ height: 4 }} />;
          default:
            return <Text key={i}>{spans(b.spans)}</Text>;
        }
      })}
    </Stack>
  );
}
