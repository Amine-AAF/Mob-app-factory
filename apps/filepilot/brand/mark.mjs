/**
 * FilePilot mark: a document with a folded corner, carrying a paper plane that
 * leaves a short dashed trail — "your files, piloted". Drawn on a 100×100 grid.
 * Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = document color, glyph = plane / trail color
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M24 10 H62 L82 30 V84 Q82 90 76 90 H24 Q18 90 18 84 V16 Q18 10 24 10 Z" fill="${bubble}"/>
  <path d="M62 10 V24 Q62 30 68 30 H82 Z" fill="#FFFFFF" opacity="0.45"/>
  <path d="M30 62 L70 42 L58 74 L50 62 Z" fill="${glyph}"/>
  <path d="M50 62 L70 42 L44 58 Z" fill="${bubble}" opacity="0.35"/>
  <path d="M28 76 Q38 74 44 68" fill="none" stroke="${glyph}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 7"/>`;
}

/** Play Store feature graphic (1024×500). Text is the product name and factual tagline only. */
export function featureGraphic({ primary, accent, ink, name, mark: m }) {
  let x = 520;
  const chips = ['JPEG', 'PNG', 'WebP', 'PDF']
    .map((label) => {
      const w = label.length * 16 + 32;
      const chip = `<rect x="${x}" y="62" width="${w}" height="42" rx="21" fill="#FFFFFF" opacity="0.08"/><text x="${x + w / 2}" y="91" text-anchor="middle" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="700" font-size="24" fill="#DCE5FF">${label}</text>`;
      x += w + 14;
      return chip;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#132A63"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  ${chips}
  <g transform="translate(70 115) scale(2.7)">${m({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="245" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="84" fill="#FFFFFF">${name}</text>
  <text x="384" y="303" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#C9D4F2">Image &amp; PDF tools</text>
  <text x="384" y="358" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="26" fill="${accent}">All Your File Tools. One Simple App.</text>
  <text x="384" y="420" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="22" fill="#8FA0C9">Processed on your device · No account</text>
</svg>`;
}
