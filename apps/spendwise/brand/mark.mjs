/**
 * SpendWise mark (original artwork): a rounded wallet whose flap carries a rising
 * three-step bar chart, with a coin clasp. Drawn on a 100x100 grid for
 * factory/scripts/generate-brand-assets.mjs.   bubble = main shape colour, glyph = detail colour
 */
export function mark({ bubble, glyph }) {
  return `
  <rect x="10" y="22" width="80" height="60" rx="16" fill="${bubble}"/>
  <path d="M10 38 Q10 22 26 22 H74 Q90 22 90 38 Z" fill="${glyph}" opacity="0.22"/>
  <g fill="${glyph}">
    <rect x="24" y="56" width="10" height="14" rx="3"/>
    <rect x="39" y="47" width="10" height="23" rx="3"/>
    <rect x="54" y="38" width="10" height="32" rx="3"/>
  </g>
  <rect x="68" y="44" width="22" height="20" rx="10" fill="${glyph}"/>
  <circle cx="79" cy="54" r="5" fill="${bubble}"/>`;
}

export function featureGraphic({ primary, accent, ink, name, mark: draw }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#0B3B36"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.12" fill="${accent}">
    <rect x="700" y="300" width="50" height="140" rx="10"/>
    <rect x="770" y="230" width="50" height="210" rx="10"/>
    <rect x="840" y="160" width="50" height="280" rx="10"/>
    <rect x="910" y="90" width="50" height="350" rx="10"/>
  </g>
  <g transform="translate(70 110) scale(2.7)">${draw({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="220" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="384" y="280" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#CFE9E4">Personal Finance &amp; Budget Planner</text>
  <text x="384" y="336" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="700" font-size="26" fill="${accent}">Understand Your Money. Take Control.</text>
</svg>`;
}
