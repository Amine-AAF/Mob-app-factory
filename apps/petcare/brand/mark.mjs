/**
 * PetCare mark: a warm heart carrying a paw print — "care for the ones you love".
 * Drawn on a 100×100 grid. Used by factory/scripts/generate-brand-assets.mjs.
 *   bubble = heart colour, glyph = paw colour
 */
export function mark({ bubble, glyph }) {
  return `
  <path d="M50 88 C46 84 12 62 10 38 C8 22 20 12 32 12 C40 12 46 16 50 23 C54 16 60 12 68 12 C80 12 92 22 90 38 C88 62 54 84 50 88 Z" fill="${bubble}"/>
  <g fill="${glyph}">
    <ellipse cx="50" cy="56" rx="14" ry="11.5"/>
    <ellipse cx="33" cy="41" rx="5.6" ry="7.2" transform="rotate(-18 33 41)"/>
    <ellipse cx="44" cy="32" rx="5.6" ry="7.6" transform="rotate(-6 44 32)"/>
    <ellipse cx="56" cy="32" rx="5.6" ry="7.6" transform="rotate(6 56 32)"/>
    <ellipse cx="67" cy="41" rx="5.6" ry="7.2" transform="rotate(18 67 41)"/>
  </g>`;
}

/** Play Store feature graphic (1024×500). Product name and factual tagline only. */
export function featureGraphic({ primary, accent, ink, name }) {
  const chips = ['Health', 'Vaccines', 'Reminders', 'Documents']
    .reduce(
      (acc, label) => {
        const w = label.length * 13 + 30;
        acc.svg += `<rect x="${acc.x}" y="372" width="${w}" height="42" rx="21" fill="#FFFFFF" opacity="0.12"/><text x="${acc.x + w / 2}" y="400" text-anchor="middle" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="700" font-size="22" fill="#FFF3EC">${label}</text>`;
        acc.x += w + 10;
        return acc;
      },
      { x: 384, svg: '' },
    ).svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#3A1F15"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <circle cx="900" cy="80" r="160" fill="${accent}" opacity="0.10"/>
  <circle cx="120" cy="470" r="120" fill="${primary}" opacity="0.18"/>
  <g transform="translate(70 110) scale(2.7)">${mark({ bubble: primary, glyph: '#FFF3EC' })}</g>
  <text x="380" y="220" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="88" fill="#FFFFFF">${name}</text>
  <text x="384" y="280" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#F3D9CC">Pet health &amp; care tracker</text>
  <text x="384" y="330" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="24" fill="${accent}">Private. Offline. No account.</text>
  ${chips}
</svg>`;
}
