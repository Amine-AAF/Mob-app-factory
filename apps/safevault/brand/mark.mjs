/**
 * SafeVault mark: a rounded shield with a keyhole — "your secrets, locked on your device".
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = shield color, glyph = keyhole color
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M50 8 L84 20 V46 Q84 74 50 92 Q16 74 16 46 V20 Z" fill="${bubble}"/>
  <path d="M50 8 L84 20 V46 Q84 74 50 92 Z" fill="#FFFFFF" opacity="0.10"/>
  <circle cx="50" cy="42" r="10" fill="${glyph}"/>
  <path d="M45 48 H55 L58 68 Q58 70 56 70 H44 Q42 70 42 68 Z" fill="${glyph}"/>`;
}

/** Play Store feature graphic (1024×500). Factual tagline only — no security superlatives. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#16244A"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(80 115) scale(2.7)">${m({ bubble: primary, glyph: accent })}</g>
  <text x="400" y="235" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="404" y="293" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#C9D4F2">Password manager &amp; secure notes</text>
  <text x="404" y="350" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">Encrypted on your device</text>
  <text x="404" y="410" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" fill="#8FA0C9">No account · No ads · Works offline</text>
</svg>`;
}
