/**
 * LearnSphere mark: a sphere holding an open book, with a small orbiting dot
 * (steady progress around a subject). Drawn on a 100×100 grid.
 * Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = symbol/detail color
 */
export function mark({ bubble, glyph }) {
  return `
  <circle cx="50" cy="50" r="40" fill="${bubble}"/>
  <path d="M24 38 Q37 32 49 38 V70 Q37 64 24 70 Z" fill="${glyph}"/>
  <path d="M51 38 Q63 32 76 38 V70 Q63 64 51 70 Z" fill="${glyph}" opacity="0.82"/>
  <circle cx="78" cy="22" r="7" fill="${glyph}"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#123544"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="880" cy="90" r="160" fill="${accent}" opacity="0.07"/>
  <circle cx="950" cy="440" r="120" fill="${primary}" opacity="0.18"/>
  <g transform="translate(64 110) scale(2.8)">${m({ bubble: primary, glyph: '#FFFFFF' })}</g>
  <text x="390" y="230" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="394" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D5E6EC">Plan, review and remember</text>
  <text x="394" y="334" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D5E6EC">everything you study.</text>
  <text x="394" y="392" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="600" font-size="24" fill="${accent}">Planner · Flashcards · Quizzes · Focus · Exams</text>
</svg>`;
}
