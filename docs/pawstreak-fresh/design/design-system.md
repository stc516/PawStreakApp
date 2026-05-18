# Design System — Cinematic Amber

> Token source: `design/stitch-fresh/stitch_pawstreak_mobile_ui_system/cinematic_amber/DESIGN.md`

---

## Philosophy

**Modern startup × cinematic dark mode.** Deep ink backgrounds let photography and amber accents glow like sunset. Surfaces feel intimate — a digital keepsake, not a utility.

---

## Implementation status

| Layer | Stitch canon | App implementation |
|-------|--------------|-------------------|
| Colors | YAML in DESIGN.md | Inline `C` objects per page + partial `src/index.css` |
| Typography | Inter scale | `fontFamily: "'Inter', sans-serif"` in pages |
| Layout | 390px mobile | `maxWidth: '390px'` on screen roots |
| Components | HTML references | React pages in `src/pages/` |

> **TODO:** Consolidate tokens into shared `src/theme/cinematicAmber.ts` to reduce drift between pages.

---

## Core tokens (quick reference)

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#131313` | Page canvas |
| `primary` | `#ffbd7f` | Labels, active nav |
| `primary-container` | `#ff9500` | CTA gradient start |
| `secondary-container` | `#ff5e00` | CTA gradient end |
| `on-surface` | `#e5e2e1` | Body text |
| `on-surface-variant` | `#dbc2ad` | Muted / secondary |
| `surface-container` | `#201f1f` | Cards |

---

## Depth model

1. **Background** — darkest (`#0A0A0A` – `#131313`)
2. **Card** — `rgba(32,31,31,0.7)` + `1px rgba(255,255,255,0.05)` border
3. **Floating** — blur nav, modals, sheets

Glow: radial amber at 10–15% opacity behind primary buttons — see `AdventurePage.tsx` Start button `boxShadow`.

---

## Shape language

- Cards: `borderRadius: 16–24px`
- Chips / CTAs: `9999px` pills
- Avatars: circular + optional amber ring

---

## Child docs

- [typography.md](./typography.md)
- [color-system.md](./color-system.md)
- [spacing-layout.md](./spacing-layout.md)
- [component-principles.md](./component-principles.md)
- [stitch-canon.md](./stitch-canon.md)
