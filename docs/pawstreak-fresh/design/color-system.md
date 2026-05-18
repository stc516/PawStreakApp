# Color System

---

## Palette intent

**Golden hour on ink.** Amber = energy + affection. Charcoal surfaces = cinema. No cool blues as primary accents.

---

## Semantic mapping

| Semantic | Hex (canon) | When to use |
|----------|-------------|-------------|
| Canvas | `#131313` / `#0A0A0A` | `minHeight: 100dvh` backgrounds |
| On-surface | `#e5e2e1` | Primary text |
| Muted | `#a38d7a` / `#dbc2ad` | Secondary labels |
| Primary accent | `#ffbd7f` | Active nav, highlights |
| CTA gradient | `#ff9500` → `#ff5e00` | Start, Let's go |
| On-primary (CTA text) | `#4b2800` | Text on amber buttons |
| Error | `#ffb4ab` | Form errors only |

---

## Surface tiers

```
Tier 0: #0A0A0A – #131313  (page)
Tier 1: #1C1C1E / rgba(32,31,31,0.7)  (cards)
Tier 2: rgba(255,255,255,0.10)  (glass buttons, header pills)
```

---

## Borders & glows

- Card border: `1px solid rgba(255,255,255,0.05)`
- Active chip: solid amber fill, dark text
- Inactive chip: dark fill + subtle border
- CTA glow: `0 0 20px rgba(255,149,0,0.2)`

---

## Page-local constants

Many pages duplicate a `C` object, e.g. `AdventurePage.tsx`, `BottomNav.tsx`. When changing brand color, search:

```
grep -r "ff9500\|ffbd7f\|131313" src/pages
```

> **TODO:** Single export from `src/theme/colors.ts`.

---

## Accessibility

- Body text on `#131313` must meet ~4.5:1 — prefer `#e5e2e1`, not dim brown for long copy.
- Amber on amber fails — use `#4b2800` on filled buttons.

---

## Source file

`design/stitch-fresh/stitch_pawstreak_mobile_ui_system/cinematic_amber/DESIGN.md`
