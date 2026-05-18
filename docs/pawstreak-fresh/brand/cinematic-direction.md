# Cinematic Direction

---

## Mood board in words

Sunset walk. Leather collar catchlight. City bokeh behind park trees. Phone UI feels like **title card over footage** — not a spreadsheet.

---

## Lighting model in UI

| Technique | Implementation |
|-----------|----------------|
| Key light | Amber CTA + active nav (`#ffbd7f`, `#ff9500`) |
| Fill | Muted warm grays on secondary text |
| Background | Ink `#0A0A0A` – `#131313` |
| Rim | `1px rgba(255,255,255,0.05)` card borders |

---

## Camera / layout metaphors

- **Today hero** — wide establishing shot (full-bleed image)
- **Active walk** — tight focus; timer as display type (thin 48px)
- **Journey** — timeline dailies / contact sheet
- **Reward** — closing credit sequence

---

## Sound (future)

> **TODO:** Subtle haptic on Wrap adventure (iOS). Optional soft chime on reward — off by default.

---

## Stitch alignment

Every launch screen should pass:

1. Dark canvas, not gray admin
2. One amber glow per viewport
3. Inter hierarchy with confident headline
4. 24px side margins

Compare: `design/stitch-fresh/.../screen.png`

---

## When to break cinema

Never for:

- Settings tables
- Error stack traces
- Debug panels

Keep those minimal and hidden from owners.

---

## Related

- [visual-identity.md](./visual-identity.md)
- [stitch-canon.md](../design/stitch-canon.md)
