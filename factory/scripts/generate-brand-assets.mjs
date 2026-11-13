#!/usr/bin/env node
/**
 * Generates an app's launcher icon, adaptive icon layers, splash icon,
 * notification icon and Play Store feature graphic from its manifest colors.
 *
 * Usage:
 *   node factory/scripts/generate-brand-assets.mjs apps/devspeak
 *
 * Requires `sharp` (not a project dependency, to keep installs lean):
 *   npm i --prefix <tmp-dir> sharp  &&  set SHARP_DIR=<tmp-dir>/node_modules
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const appDir = path.resolve(process.argv[2] ?? 'apps/devspeak');
const manifest = JSON.parse(fs.readFileSync(path.join(appDir, 'app.manifest.json'), 'utf8'));
const sharpDir = process.env.SHARP_DIR;
const require = createRequire(sharpDir ? path.join(sharpDir, 'noop.js') : import.meta.url);
const sharp = require('sharp');

const { primary, accent, splashBackground: ink } = manifest.brand;
const out = path.join(appDir, 'assets', 'images');
const store = path.join(appDir, 'store', 'graphics');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(store, { recursive: true });

/**
 * Apps may provide their own mark in <app>/brand/mark.mjs:
 *   export function mark({ bubble, glyph }) -> SVG body on a 100x100 grid (bubble = main shape, glyph = detail)
 *   export function featureGraphic({ primary, accent, ink, name }) -> full 1024x500 SVG (optional)
 * Without it, the DevSpeak mark below is used (keeps DevSpeak's output unchanged).
 */
const custom = path.join(appDir, 'brand', 'mark.mjs');
const brandModule = fs.existsSync(custom) ? await import(pathToFileURL(custom).href) : null;

/** Speech bubble with a code chevron "</>" — the DevSpeak mark. Drawn on a 100x100 grid. */
const defaultMark = ({ bubble, glyph }) => `
  <path d="M18 14 H82 Q92 14 92 24 V62 Q92 72 82 72 H44 L28 86 Q26 88 26 85 V72 H18 Q8 72 8 62 V24 Q8 14 18 14 Z" fill="${bubble}"/>
  <g fill="none" stroke="${glyph}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="36,31 25,43 36,55"/>
    <polyline points="64,31 75,43 64,55"/>
    <line x1="55" y1="28" x2="45" y2="58"/>
  </g>`;

const mark = brandModule?.mark ?? defaultMark;

const svg = (size, body, bg = 'none') =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${bg !== 'none' ? `<rect width="100" height="100" fill="${bg}"/>` : ''}${body}</svg>`);

/** Places the mark at `scale` of the canvas, centred (accounting for the tail). */
const placed = (scale, opts) => `<g transform="translate(${50 - 50 * scale} ${50 - 50 * scale + 3 * scale}) scale(${scale})">${mark(opts)}</g>`;

async function png(file, buffer, size) {
  await sharp(buffer, { density: 384 }).resize(size, size).png().toFile(file);
  console.log('✓', path.relative(process.cwd(), file));
}

// Legacy / store icon 1024 (Play Console needs 512x512, generated below).
const iconBody = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#151B33"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>${placed(0.78, { bubble: primary, glyph: accent })}`;
await png(path.join(out, 'icon.png'), svg(1024, iconBody), 1024);
await png(path.join(store, 'play-icon-512.png'), svg(512, iconBody), 512);

// Adaptive icon: foreground must fit the 66% safe zone of a 108dp canvas.
await png(path.join(out, 'adaptive-icon.png'), svg(1024, placed(0.6, { bubble: primary, glyph: accent })), 1024);
/** White silhouette with the glyph cut out (Android uses only the alpha channel). */
const silhouette = (scale) =>
  `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#000"/>${placed(scale, { bubble: '#FFFFFF', glyph: '#000000' })}</mask></defs><rect width="100" height="100" fill="#FFFFFF" mask="url(#m)"/>`;
await png(path.join(out, 'adaptive-icon-monochrome.png'), svg(1024, silhouette(0.6)), 1024);

// Splash icon (shown on brand background by expo-splash-screen).
await png(path.join(out, 'splash-icon.png'), svg(512, placed(0.9, { bubble: primary, glyph: accent })), 512);

// Notification icon: Android requires white-on-transparent silhouette.
await png(path.join(out, 'notification-icon.png'), svg(96, silhouette(0.92)), 96);

// Play Store feature graphic 1024x500.
const feature = brandModule?.featureGraphic
  ? Buffer.from(brandModule.featureGraphic({ primary, accent, ink, name: manifest.name, mark }))
  : Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="#1A1446"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.07" font-family="Consolas, monospace" font-size="22" fill="${accent}">
    <text x="470" y="70">standup.say("Yesterday I fixed the login bug.")</text>
    <text x="520" y="440">review.explain("This change reduces latency.")</text>
    <text x="40" y="470">interview.answer("I'd start by checking the logs.")</text>
  </g>
  <g transform="translate(70 120) scale(2.6)">${mark({ bubble: primary, glyph: accent })}</g>
  <text x="380" y="235" font-family="Segoe UI, Roboto, Arial, sans-serif" font-weight="800" font-size="86" fill="#FFFFFF">${manifest.name}</text>
  <text x="384" y="292" font-family="Segoe UI, Roboto, Arial, sans-serif" font-size="32" fill="#C9CDE0">English for developers</text>
  <text x="384" y="350" font-family="Consolas, monospace" font-size="24" fill="${accent}">// Learn English. Speak Tech. Grow Your Career.</text>
</svg>`);
await sharp(feature).png().toFile(path.join(store, 'feature-graphic-1024x500.png'));
console.log('✓ feature graphic');
