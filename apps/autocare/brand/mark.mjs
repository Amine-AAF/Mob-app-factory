/**
 * AutoCare mark: a rounded shield-like tile holding a speedometer arc with a needle
 * and a small wrench-head notch — "care" for the car. Bold strokes, legible at 48 px.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = symbol/detail color
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="8" y="8" width="84" height="84" rx="24" fill="${bubble}"/>
  <path d="M24 64 A28 28 0 1 1 76 64" fill="none" stroke="${glyph}" stroke-width="7" stroke-linecap="round"/>
  <g stroke="${glyph}" stroke-width="4" stroke-linecap="round">
    <line x1="30" y1="44" x2="35" y2="47"/>
    <line x1="50" y1="30" x2="50" y2="36"/>
    <line x1="70" y1="44" x2="65" y2="47"/>
  </g>
  <line x1="50" y1="58" x2="64" y2="40" stroke="${glyph}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="58" r="7" fill="${glyph}"/>
  <path d="M36 76 H64" stroke="${glyph}" stroke-width="6" stroke-linecap="round"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#14263F"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <path d="M600 470 A260 260 0 0 1 1000 220" fill="none" stroke="${accent}" stroke-width="10" opacity="0.12"/>
  <g transform="translate(64 110) scale(2.8)">${m({ bubble: primary, glyph: '#FFFFFF' })}</g>
  <text x="390" y="230" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="394" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D6E2F2">Your car's digital logbook.</text>
  <text x="394" y="334" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D6E2F2">Private. Offline. Complete.</text>
  <text x="394" y="392" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="600" font-size="24" fill="${accent}">Maintenance · Fuel · Expenses · Insurance · Documents</text>
</svg>`;
}
