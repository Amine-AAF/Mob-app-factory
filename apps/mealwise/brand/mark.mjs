/**
 * MealWise mark: a warm bowl with a fresh leaf on its front and two wisps of
 * steam. Drawn on a 100x100 grid for factory/scripts/generate-brand-assets.mjs.
 *   bubble = main shape (bowl + steam), glyph = detail (leaf, cut out in silhouettes)
 */
export function mark({ bubble, glyph }) {
  return `
  <g fill="none" stroke="${bubble}" stroke-width="5" stroke-linecap="round">
    <path d="M38 30 C 32 24 44 18 38 10"/>
    <path d="M58 30 C 52 24 64 18 58 10"/>
  </g>
  <path d="M10 42 H90 Q90 82 50 86 Q10 82 10 42 Z" fill="${bubble}"/>
  <rect x="34" y="86" width="32" height="6" rx="3" fill="${bubble}"/>
  <path d="M50 76 C 34 72 32 56 44 48 C 50 44 60 46 66 50 C 66 64 60 74 50 76 Z" fill="${glyph}"/>
  <path d="M50 74 C 52 64 56 56 63 51" fill="none" stroke="${bubble}" stroke-width="2.5" stroke-linecap="round"/>`;
}

/** Play Store feature graphic 1024x500. */
export function featureGraphic({ primary, accent, ink, name, mark: draw }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#3A1F12"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.10" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="#FFFFFF">
    <text x="560" y="70">Mon · Lentil soup · Tacos</text>
    <text x="600" y="440">☐ Tomatoes  ☐ Rice  ☑ Eggs</text>
    <text x="40" y="470">Breakfast · Lunch · Dinner · Snacks</text>
  </g>
  <g transform="translate(70 110) scale(2.8)">${draw({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="235" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="384" y="292" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="34" fill="#F3D9C8">Meal planner &amp; grocery list</text>
  <text x="384" y="348" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">Plan the week. Shop smarter. Waste less.</text>
</svg>`;
}
