# ASO — keywords & screenshots plan

## Keywords (titles / descriptions, not a keyword field on Google Play)

- **en:** photo editor, image resizer, compress photo, reduce image size, convert to webp, jpg to png, crop photo, collage maker, watermark, add text to photo, instagram size, story maker, youtube thumbnail, batch resize, offline, no ads (premium), privacy
- **fr :** éditeur photo, redimensionner image, compresser photo, réduire taille image, convertir webp, jpg en png, recadrer, créateur de collage, filigrane, texte sur photo, format instagram, miniature youtube, traitement par lots, hors ligne, confidentialité
- **es:** editor de fotos, redimensionar imagen, comprimir foto, reducir tamaño, convertir webp, jpg a png, recortar foto, collage, marca de agua, texto en foto, tamaño instagram, miniatura youtube, por lotes, sin conexión, privacidad

## Category & rating
Category: Photography. Content rating: Everyone (no user-generated content shared by the app, no chat).

## Screenshots (phone 1080 × 2400, 8 max) — to capture on a device/emulator (dev build)

1. Home — "Edit. Resize. Create. Share." + import button
2. Editor — filter applied, compare button visible
3. Crop with 4:5 ratio handles
4. Compressor — original vs. estimate, then result sheet with "-68 %"
5. Social sizes — Instagram story preset with drag hint
6. Collage — 4-photo layout with rounded corners
7. Text & watermark on a product photo
8. Privacy — "Your photos stay on your device"

Feature graphic 1024 × 500 and icons: `pnpm brand-assets apps/imagecraft` (uses `brand/mark.mjs`; needs `sharp`, see the script header).
Screenshots are not generated automatically (they require a running dev build): see factory/tracking/imagecraft.md.
