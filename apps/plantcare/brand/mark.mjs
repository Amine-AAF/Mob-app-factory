/**
 * PlantCare mark: a single rounded leaf with a central vein and a water drop.
 * Drawn on a 100×100 grid for factory/scripts/generate-brand-assets.mjs.
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M50 10 C78 22 88 48 74 72 C64 88 40 92 28 80 C14 66 18 36 50 10 Z" fill="${bubble}"/>
  <path d="M30 80 C42 62 52 44 58 24" fill="none" stroke="${glyph}" stroke-width="5" stroke-linecap="round"/>
  <path d="M44 56 L58 52 M38 68 L52 66" fill="none" stroke="${glyph}" stroke-width="4" stroke-linecap="round"/>
  <path d="M74 14 C78 20 81 24 81 28 C81 32 78 35 74 35 C70 35 67 32 67 28 C67 24 70 20 74 14 Z" fill="${glyph}"/>`;
}

export function featureGraphic({ primary, accent, ink, name }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <rect width="1024" height="500" fill="${ink}"/>
  <circle cx="860" cy="120" r="220" fill="${primary}" opacity="0.35"/>
  <circle cx="900" cy="420" r="160" fill="${accent}" opacity="0.25"/>
  <g transform="translate(90 130) scale(2.4)">${mark({ bubble: primary, glyph: '#FFFFFF' })}</g>
  <text x="380" y="235" font-family="sans-serif" font-size="78" font-weight="800" fill="#FFFFFF">${name}</text>
  <text x="382" y="300" font-family="sans-serif" font-size="34" fill="#CFE6D6">Plant care &amp; garden companion</text>
</svg>`;
}
