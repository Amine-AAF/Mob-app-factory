/**
 * ImageCraft mark (original artwork): a rounded photo tile with a mountain and a sun,
 * framed by two crop corners. Drawn on a 100x100 grid for factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape colour, glyph = detail colour
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="14" y="14" width="72" height="66" rx="16" fill="${bubble}"/>
  <path d="M22 70 L42 46 L54 59 L62 50 L78 70 Z" fill="${glyph}"/>
  <circle cx="64" cy="32" r="7" fill="${glyph}"/>
  <g fill="none" stroke="${glyph}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6,24 6,6 24,6"/>
    <polyline points="94,70 94,88 76,88"/>
  </g>`;
}

export function featureGraphic({ primary, accent, ink, name, mark: draw }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#22145A"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.10" fill="${accent}">
    <rect x="640" y="40" width="160" height="200" rx="18"/>
    <rect x="820" y="40" width="160" height="120" rx="18"/>
    <rect x="820" y="180" width="160" height="280" rx="18"/>
    <rect x="640" y="260" width="160" height="200" rx="18"/>
  </g>
  <g transform="translate(70 110) scale(2.7)">${draw({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="220" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="384" y="280" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#D6D0F5">Photo &amp; Image Editor</text>
  <text x="384" y="336" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="700" font-size="26" fill="${accent}">Edit. Resize. Create. Share.</text>
</svg>`;
}
