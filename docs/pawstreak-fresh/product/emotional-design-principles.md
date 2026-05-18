# Emotional Design Principles

---

## 1. Keepsake over dashboard

The app should feel like opening a **photo album at golden hour**, not a SaaS control panel. Fewer numbers on screen; more narrative.

**In code:** Hero card on Today uses mission title + `locationHint`, not XP widgets (`DashboardPage.tsx`).

---

## 2. Dog as subject

Copy structure: **`{dogName} + verb + feeling`**

- ✅ "Bailey had a great day."
- ❌ "You completed your adventure!"

See [dog-first-philosophy.md](../brand/dog-first-philosophy.md).

---

## 3. Warm darkness

Backgrounds are ink-black; amber is **light source**, not decoration. Glow behind primary actions only.

Tokens: [color-system.md](../design/color-system.md).

---

## 4. One focal action per screen

- Today → **Let's go**
- Plan → **Start** on a place
- Active → **Wrap adventure**
- Reward → **Done**

No competing primary CTAs.

---

## 5. Empty states invite story

Journey with zero walks shows encouragement + CTA to Plan — never fake demo memories at launch.

---

## 6. Completion is sensory

Reward and completion modals emphasize **what happened** (memory text, location hint) before stats.

---

## 7. Respect the walk

Active mode removes distraction: no camera dead-ends, no notification bell, no overflow menus at launch.

---

## Anti-reference

See [anti-patterns.md](./anti-patterns.md).
