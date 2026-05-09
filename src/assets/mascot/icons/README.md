# icons/

App icon variants and simplified mascot marks.

The current shipping app icons live in `public/` (`icon-192.png`,
`icon-512.png`, `apple-touch-icon.png`, `maskable-icon-512.png`,
`icon-maskable.svg`, `icon.svg`, `favicon.svg`). This folder is for **source**
art that those exports come from, plus any future mark variations:

- Bailey-only icon (full color)
- Meiomi-only icon (full color)
- Duo icon (Bailey + Meiomi)
- Monochrome wordmark mark
- Maskable safe-zone source

## Naming

```
icon-bailey-square.png
icon-meiomi-square.png
icon-duo-square.png
icon-mark-mono.svg
```

## Workflow

1. Update or add the source art here.
2. Re-run `npm run icons` (script: `scripts/generate-pwa-icons.mjs`) which
   uses Playwright to rasterize the SVG sources at icon sizes into `public/`.
3. Verify the manifest entries in `index.html` and `public/manifest.webmanifest`
   still resolve correctly.
