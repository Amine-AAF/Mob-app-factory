/**
 * HomeCare mark: a rounded house with a care checkmark in the doorway —
 * "your home, looked after". Drawn on a 100×100 grid.
 * Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = house color, glyph = checkmark color
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M50 10 Q53 10 55.5 12.2 L88 40 Q91 42.6 91 46.6 V82 Q91 90 83 90 H17 Q9 90 9 82 V46.6 Q9 42.6 12 40 L44.5 12.2 Q47 10 50 10 Z" fill="${bubble}"/>
  <path d="M33 56 L45 68 L69 44" fill="none" stroke="${glyph}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Play Store feature graphic (1024×500). Product name and factual tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#0E3B39"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g transform="translate(80 115) scale(2.7)">${m({ bubble: primary, glyph: accent })}</g>
  <text x="390" y="230" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="394" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#CFE7E4">Home maintenance &amp; organizer</text>
  <text x="394" y="345" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">Equipment · Warranties · Documents · Bills</text>
  <text x="394" y="405" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" fill="#8FB5B1">Works offline · No account · Data stays on your phone</text>
</svg>`;
}
