/**
 * TravelWise mark (original): a rounded location pin whose head holds a paper plane
 * flying along a dotted route. Bold, simple shapes so it stays legible at 48 px.
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape color, glyph = symbol/detail color
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M50 8 C29 8 16 23 16 41 C16 62 39 80 47.5 90 Q50 93 52.5 90 C61 80 84 62 84 41 C84 23 71 8 50 8 Z" fill="${bubble}"/>
  <path d="M30 47 L70 28 L58 62 L49 50 Z" fill="${glyph}"/>
  <path d="M49 50 L70 28 L44 54 Z" fill="${bubble}" opacity="0.35"/>
  <g fill="${glyph}">
    <circle cx="37" cy="64" r="2.6"/>
    <circle cx="45" cy="70" r="2.6"/>
  </g>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  const route = `<path d="M560 420 C 640 300, 760 380, 820 260 S 930 120, 990 90" fill="none" stroke="${accent}" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round" opacity="0.45"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#0B3B37"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  ${route}
  <g transform="translate(64 110) scale(2.8)">${m({ bubble: primary, glyph: '#FFFFFF' })}</g>
  <text x="390" y="230" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="394" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D4ECE9">Plan your trip.</text>
  <text x="394" y="334" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D4ECE9">Enjoy every moment.</text>
  <text x="394" y="392" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="600" font-size="24" fill="${accent}">Itinerary · Bookings · Budget · Packing · Offline</text>
</svg>`;
}
