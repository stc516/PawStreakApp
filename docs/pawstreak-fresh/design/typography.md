# Typography

> Canon: Inter — `design/.../cinematic_amber/DESIGN.md`

---

## Font stack

```css
font-family: 'Inter', sans-serif;
```

Loaded via app shell / `index.html` (verify weights 400, 600, 700 present).

---

## Scale

| Role | Size | Weight | Line height | Use |
|------|------|--------|-------------|-----|
| headline-lg | 32px (28 mobile) | 700 | 1.2 | Hero titles |
| headline-md | 24px | 600 | 1.3 | Section headers |
| body-lg | 17px | 400 | 1.5 | Card titles |
| body-md | 15px | 400 | 1.5 | Descriptions |
| label-sm | 12px | 600 | 1.2 + tracking | Eyebrows, caps |
| display-time | 48px | 300 | 1 | Active walk timer |

---

## Rules

1. **High contrast** on dark — never `#666` body on `#131313`.
2. **Thin weights only** for large numerics (timer), not paragraphs.
3. **Uppercase + letter-spacing** for category eyebrows (`adventure-milestone-eyebrow`).
4. **Truncate with ellipsis** on single-line titles in cards — see Plan place rows.

---

## In-app examples

| Location | Style |
|----------|-------|
| `DashboardPage` dog name | ~28px bold white |
| `AdventurePage` send-off | 18px semibold |
| `BottomNav` labels | 10px bold |
| `RewardPage` headline | Large emotional line |

---

## Notion note

Import this page alongside [color-system.md](./color-system.md) as a paired reference for designers.
