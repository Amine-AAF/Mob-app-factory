/**
 * Eventora mark: a calendar card with binder rings and a four-point sparkle —
 * "the day you're planning". Drawn on a 100×100 grid.
 * Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = card color, glyph = sparkle / rings color
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="14" y="20" width="72" height="66" rx="12" fill="${bubble}"/>
  <path d="M26 20 H74 Q86 20 86 32 V36 H14 V32 Q14 20 26 20 Z" fill="#FFFFFF" opacity="0.18"/>
  <rect x="30" y="12" width="7" height="17" rx="3.5" fill="${glyph}"/>
  <rect x="63" y="12" width="7" height="17" rx="3.5" fill="${glyph}"/>
  <path d="M50 42 C52 54 55 57 67 59 C55 61 52 64 50 76 C48 64 45 61 33 59 C45 57 48 54 50 42 Z" fill="${glyph}"/>
  <circle cx="69" cy="45" r="3" fill="${glyph}" opacity="0.8"/>
  <circle cx="32" cy="74" r="2.2" fill="${glyph}" opacity="0.6"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and factual taglines only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#3A1A35"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="930" cy="70" r="140" fill="${accent}" opacity="0.10"/>
  <circle cx="860" cy="470" r="110" fill="${primary}" opacity="0.35"/>
  <g transform="translate(70 115) scale(2.7)">${m({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="240" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="384" y="300" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#EAD9E6">Event Planner &amp; Organizer</text>
  <text x="384" y="356" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="25" fill="${accent}">Guests · RSVP · Budget · Seating · Timeline</text>
  <text x="384" y="418" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" fill="#B9A6B6">Works offline · No account · Your data stays on your phone</text>
</svg>`;
}
