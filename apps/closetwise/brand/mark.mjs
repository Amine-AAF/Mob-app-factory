/**
 * ClosetWise mark: a clothes hanger (hook + shoulders) on a soft rounded tile, with a small
 * camel "tag" — the wardrobe made smart. Thick strokes so it stays legible at 48 px.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = symbol/detail color
 */
export function mark({ bubble, glyph }) {
  const s = `stroke="${glyph}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  return `
  <rect x="8" y="8" width="84" height="84" rx="26" fill="${bubble}"/>
  <path d="M43 30 Q43 22 50 22 Q57 22 57 29 Q57 34 50 37 L50 42" ${s}/>
  <path d="M50 42 L20 64 Q16 68 22 68 L78 68 Q84 68 80 64 Z" ${s}/>
  <circle cx="66" cy="76" r="5" fill="${glyph}"/>`;
}

/** Play Store feature graphic (1024×500): product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#2B2320"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <rect x="660" y="60" width="300" height="380" rx="28" fill="${accent}" opacity="0.08"/>
  <rect x="700" y="100" width="220" height="300" rx="20" fill="${accent}" opacity="0.10"/>
  <g transform="translate(70 115) scale(2.7)">${m({ bubble: primary, glyph: '#F7F3EE' })}</g>
  <text x="380" y="225" font-family="Georgia, 'Noto Serif', serif" font-size="86" fill="#F7F3EE">${name}</text>
  <text x="384" y="285" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="30" fill="#E6DCD1">Your wardrobe, beautifully organised.</text>
  <text x="384" y="345" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="600" font-size="22" letter-spacing="3" fill="${accent}">WARDROBE · OUTFITS · PLANNER · PACKING</text>
</svg>`;
}
