import { Text } from '@factory/design-system';
import { View } from 'react-native';

/**
 * "Simple formatting" for secure notes, rendered with plain Text (no WebView, no HTML,
 * no link auto-detection): `# Heading`, `- bullet` / `* bullet`, `**bold**`.
 */
export type NoteBlock = { kind: 'heading' | 'bullet' | 'text'; spans: { text: string; bold: boolean }[] };

export function parseSimpleFormat(body: string): NoteBlock[] {
  return body.split('\n').map((line) => {
    let kind: NoteBlock['kind'] = 'text';
    let content = line;
    if (/^#{1,3}\s+/.test(line)) {
      kind = 'heading';
      content = line.replace(/^#{1,3}\s+/, '');
    } else if (/^\s*[-*]\s+/.test(line)) {
      kind = 'bullet';
      content = line.replace(/^\s*[-*]\s+/, '');
    }
    const spans = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((s) => (s.startsWith('**') && s.endsWith('**') && s.length > 4 ? { text: s.slice(2, -2), bold: true } : { text: s, bold: false }));
    return { kind, spans: spans.length ? spans : [{ text: '', bold: false }] };
  });
}

export function FormattedNote({ body }: { body: string }) {
  const blocks = parseSimpleFormat(body);
  return (
    <View style={{ gap: 4 }}>
      {blocks.map((b, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6 }}>
          {b.kind === 'bullet' ? <Text>•</Text> : null}
          <Text variant={b.kind === 'heading' ? 'heading' : 'body'} style={{ flex: 1 }}>
            {b.spans.map((s, j) => (
              <Text key={j} variant={b.kind === 'heading' ? 'heading' : 'body'} style={s.bold ? { fontWeight: '700' } : undefined}>
                {s.text}
              </Text>
            ))}
          </Text>
        </View>
      ))}
    </View>
  );
}
