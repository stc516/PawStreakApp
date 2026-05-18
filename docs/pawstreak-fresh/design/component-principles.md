# Component Principles

---

## Buttons

### Primary (gradient pill)

- Background: linear `#ff9500` → `#ff5e00`
- Text: `#4b2800`, bold
- Glow on hero actions
- Examples: `dashboard-start-adventure-cta`, Plan **Start**

### Secondary (glass)

- `rgba(255,255,255,0.10)` + blur
- White icon stroke
- Example: back chevron on Adventure active header

### Destructive / quiet

- No red primary at launch — **Wrap adventure** is neutral glass, not alarm red

---

## Chips (Today moods)

File: `DashboardPage.tsx` → `VIBE_CHIPS`

| State | Style |
|-------|-------|
| Active | Amber fill, no border |
| Inactive | `1px rgba(255,255,255,0.05)` border |

Click → `selectVibe()` — must update `dashboard-gm-title` (e2e covered).

---

## Cards

- Dark fill + subtle border + 16px radius
- Hero card: full-bleed image with bottom gradient scrim for text
- Stat row: tappable only when wired (Places → `/wild`)

---

## Bottom sheet

Reference: `MemoryDetailSheet` in `StoryPage.tsx`

- Drag handle, share action, dismiss on backdrop
- Prefer over new routes for detail views

---

## Modals

Adventure completion: `role="dialog"` + `aria-label="Adventure complete"`

- Share Adventure + Done
- No dead "Take Photo" at launch

---

## Shared components (inventory)

| Component | Path |
|-----------|------|
| BottomNav | `src/components/BottomNav.tsx` |
| AccountStatusChip | `src/components/auth/AccountStatusChip.tsx` |
| SaveProgressNudge | `src/components/auth/SaveProgressNudge.tsx` |
| LegalFooter | `src/components/legal/LegalFooter.tsx` |
| HeroCard | `src/components/HeroCard.tsx` (legacy/tailwind — verify usage) |

---

## Testability

Any new interactive primary control on the core loop needs `data-testid`. See [testing.md](../engineering/testing.md).
