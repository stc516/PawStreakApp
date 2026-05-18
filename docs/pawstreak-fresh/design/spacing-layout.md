# Spacing & Layout

---

## Frame

| Constraint | Value | Where |
|------------|-------|-------|
| Max width | 390px | Page roots, `BottomNav` |
| Horizontal margin | 24px | Standard content padding |
| Bottom safe area | `env(safe-area-inset-bottom)` | `BottomNav` |
| Min height | `100dvh` | Full-screen pages |

---

## Spacing scale (8px base)

| Token (canon) | px | Use |
|---------------|-----|-----|
| stack-sm | 8 | Tight stacks |
| stack-md | 16 | Card internal gap |
| stack-lg | 24 | Section separation |
| card-padding | 20 | Card insets |
| gutter-grid | 16 | Grid gaps |

---

## Fixed chrome

| Element | Position | z-index |
|---------|----------|---------|
| Bottom nav | `fixed` bottom | 30 |
| Memory sheet | bottom sheet | 40+ |
| Modals | centered overlay | 50+ |

Content areas pad bottom ~80–100px to clear nav.

---

## Scroll patterns

- **Horizontal:** Today mood chips (`overflowX: auto`, hide scrollbar)
- **Vertical:** Journey timeline, Plan place list
- **No horizontal page scroll** on main screens

---

## Tablet / desktop

Launch is **phone-first**. Wider viewports center the 390px column — do not stretch cards full-bleed on desktop without design review.

> **TODO:** Document breakpoint strategy if we add `md:` Tailwind layouts beyond current inline styles.

---

## Related

- [navigation-system.md](./navigation-system.md)
- [component-principles.md](./component-principles.md)
