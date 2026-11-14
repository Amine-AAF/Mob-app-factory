/**
 * FitTrack mark: a rounded tile holding a dumbbell set on a rising progress arc
 * ("train → progress"). Drawn on a 100×100 grid for factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = detail color
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="8" y="8" width="84" height="84" rx="24" fill="${bubble}"/>
  <path d="M24 70 A32 32 0 0 1 76 34" fill="none" stroke="${glyph}" stroke-width="5" stroke-linecap="round" opacity="0.35"/>
  <polyline points="66,30 77,33 74,44" fill="none" stroke="${glyph}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"/>
  <g transform="rotate(-30 50 54)">
    <rect x="28" y="51" width="44" height="7" rx="3.5" fill="${glyph}"/>
    <rect x="22" y="40" width="9" height="29" rx="3.5" fill="${glyph}"/>
    <rect x="69" y="40" width="9" height="29" rx="3.5" fill="${glyph}"/>
    <rect x="15" y="45" width="7" height="19" rx="3" fill="${glyph}"/>
    <rect x="78" y="45" width="7" height="19" rx="3" fill="${glyph}"/>
  </g>`;
}

/** Play Store feature graphic (1024×500): product name, tagline and the mark only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${primary}"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(96 110) scale(2.8)">${m({ bubble: '#FFFFFF', glyph: primary })}</g>
  <text x="430" y="238" font-family="Segoe UI, Roboto, sans-serif" font-size="78" font-weight="800" fill="#FFFFFF">${name}</text>
  <text x="432" y="300" font-family="Segoe UI, Roboto, sans-serif" font-size="32" fill="${accent}">Plan. Train. Track your progress.</text>
</svg>`;
}
