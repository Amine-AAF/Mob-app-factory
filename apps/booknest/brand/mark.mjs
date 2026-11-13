/**
 * BookNest mark: an open book seen from the front, its two pages curving like a
 * nest, with a bookmark ribbon falling from the spine.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = detail color
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="8" y="8" width="84" height="84" rx="24" fill="${bubble}"/>
  <path d="M50 34 C42 28 30 27 20 30 V70 C30 67 42 68 50 74 Z" fill="${glyph}"/>
  <path d="M50 34 C58 28 70 27 80 30 V70 C70 67 58 68 50 74 Z" fill="${glyph}" opacity="0.82"/>
  <path d="M50 34 V74" stroke="${bubble}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M60 31 V52 L64.5 47.5 L69 52 V29.5" fill="${bubble}" opacity="0.9"/>`;
}

/** Play Store feature graphic (1024×500): product name, tagline and the mark only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${primary}"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(96 110) scale(2.8)">${m({ bubble: '#FBF6EE', glyph: primary })}</g>
  <text x="430" y="238" font-family="Georgia, 'Noto Serif', serif" font-size="80" font-weight="700" fill="#FBF6EE">${name}</text>
  <text x="432" y="300" font-family="Georgia, 'Noto Serif', serif" font-size="32" font-style="italic" fill="${accent}">Your library. Your reading life.</text>
</svg>`;
}
