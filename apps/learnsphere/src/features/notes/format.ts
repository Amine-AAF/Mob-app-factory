/**
 * Lightweight note formatting (a small, safe subset of Markdown):
 *   # Title            -> heading
 *   ## Subtitle        -> subheading
 *   - item / * item    -> bullet list
 *   1. item            -> numbered list
 *   > text             -> quote / key idea
 *   ==text==           -> highlight
 *   **text**           -> bold
 * Stored as plain text so notes stay portable and exportable as Markdown.
 */
export type InlineSpan = { text: string; highlight?: boolean; bold?: boolean };

export type NoteBlock =
  | { type: 'heading'; spans: InlineSpan[] }
  | { type: 'subheading'; spans: InlineSpan[] }
  | { type: 'bullet'; spans: InlineSpan[] }
  | { type: 'numbered'; index: number; spans: InlineSpan[] }
  | { type: 'quote'; spans: InlineSpan[] }
  | { type: 'paragraph'; spans: InlineSpan[] }
  | { type: 'spacer' };

const TOKEN = /(==[^=]+==|\*\*[^*]+\*\*)/g;

export function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  for (const part of text.split(TOKEN)) {
    if (!part) continue;
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) spans.push({ text: part.slice(2, -2), highlight: true });
    else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) spans.push({ text: part.slice(2, -2), bold: true });
    else spans.push({ text: part });
  }
  return spans;
}

export function parseNote(body: string): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  let lastNumber = 0;
  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if (line.trim() === '') {
      if (blocks.length && blocks[blocks.length - 1]?.type !== 'spacer') blocks.push({ type: 'spacer' });
      lastNumber = 0;
      continue;
    }
    if ((m = line.match(/^##\s+(.*)$/))) blocks.push({ type: 'subheading', spans: parseInline(m[1] ?? '') });
    else if ((m = line.match(/^#\s+(.*)$/))) blocks.push({ type: 'heading', spans: parseInline(m[1] ?? '') });
    else if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) blocks.push({ type: 'bullet', spans: parseInline(m[1] ?? '') });
    else if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      lastNumber = lastNumber + 1;
      blocks.push({ type: 'numbered', index: lastNumber, spans: parseInline(m[2] ?? '') });
      continue;
    } else if ((m = line.match(/^>\s?(.*)$/))) blocks.push({ type: 'quote', spans: parseInline(m[1] ?? '') });
    else blocks.push({ type: 'paragraph', spans: parseInline(line) });
    lastNumber = 0;
  }
  while (blocks[blocks.length - 1]?.type === 'spacer') blocks.pop();
  return blocks;
}

/** Plain text without formatting marks, used for search and previews. */
export function plainText(body: string): string {
  return body
    .replace(/^#{1,2}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

export function preview(body: string, max = 140): string {
  const text = plainText(body).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Toolbar actions: prefix the current line or wrap the selection. */
export type FormatAction = 'heading' | 'subheading' | 'bullet' | 'numbered' | 'quote' | 'highlight' | 'bold';

export function applyFormat(body: string, selection: { start: number; end: number }, action: FormatAction): { body: string; cursor: number } {
  const { start, end } = selection;
  if (action === 'highlight' || action === 'bold') {
    const mark = action === 'highlight' ? '==' : '**';
    const selected = body.slice(start, end) || '…';
    const next = `${body.slice(0, start)}${mark}${selected}${mark}${body.slice(end)}`;
    return { body: next, cursor: start + mark.length + selected.length + mark.length };
  }
  const prefix = { heading: '# ', subheading: '## ', bullet: '- ', numbered: '1. ', quote: '> ' }[action];
  const lineStart = body.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  const line = body.slice(lineStart);
  const stripped = line.replace(/^(#{1,2}\s+|[-*•]\s+|\d+[.)]\s+|>\s?)/, '');
  const removed = line.length - stripped.length;
  const already = line.startsWith(prefix);
  const next = body.slice(0, lineStart) + (already ? '' : prefix) + stripped;
  return { body: next, cursor: Math.max(lineStart, end - removed + (already ? 0 : prefix.length)) };
}

/** Markdown export of a note (premium). */
export function noteToMarkdown(note: { title: string; body: string; tags: string[] }): string {
  const tags = note.tags.length ? `\n\n${note.tags.map((t) => `#${t}`).join(' ')}` : '';
  return `# ${note.title}\n\n${note.body.trim()}${tags}\n`;
}
