/** Lowercase, strip accents and collapse whitespace: used for search and short-answer grading. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parses "tag1, tag2 #tag3" into unique normalized tags. */
export function parseTags(input: string): string[] {
  const tags = input
    .split(/[,#\n]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 30);
  return Array.from(new Set(tags)).slice(0, 12);
}

/** Escapes LIKE wildcards so user input is matched literally (use with ESCAPE '\'). */
export function likePattern(query: string): string {
  const escaped = normalizeText(query).replace(/[\\%_]/g, (c) => '\\' + c);
  return `%${escaped}%`;
}
