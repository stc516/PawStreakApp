# QA Checklist

> Manual pass before production deploy. Complement — do not replace — `npm run test:e2e`.

---

## Environment

- [ ] Test on mobile viewport (390×844) or real phone
- [ ] Test fresh install (clear site data)
- [ ] Test with Supabase configured (if production uses auth)
- [ ] Test demo mode (no Supabase)

---

## Onboarding

- [ ] Welcome → name → intro → details → personality → energy → goals → ZIP
- [ ] Unsupported ZIP shows appropriate messaging (83702 test)
- [ ] Lands on Today after completion

---

## Today

- [ ] Hero shows mission title + location hint
- [ ] Each mood chip changes `dashboard-gm-title`
- [ ] **Let's go** opens Plan
- [ ] No weather/location placeholder header
- [ ] No links to packs/community
- [ ] Save nudge visible for local-only user

---

## Plan → Active → Complete

- [ ] Plan shows place cards with **Start**
- [ ] Active shows timer, milestone copy, memory field
- [ ] No bell, camera, or ⋯ menu
- [ ] **Wrap adventure** opens completion modal
- [ ] Share + Done work
- [ ] Reward shows dog-first headline + memory

---

## Journey

- [ ] Completed walk appears in timeline
- [ ] Tap opens memory sheet
- [ ] Share from sheet does not crash
- [ ] Empty state before first walk (fresh user)

---

## Path

- [ ] Shows dog name on current card
- [ ] Six tiers visible
- [ ] Exactly one `data-current` tier

---

## Profile

- [ ] Back returns to Today
- [ ] Auth form or not-configured message
- [ ] No fake stats rows / settings gear

---

## Legal

- [ ] Footer privacy + terms open correct pages

---

## Regression

```bash
npm run test:e2e
```

---

## Screenshots (optional)

```bash
node scripts/capture-launch-screenshots.mjs
```

Compare to `design/stitch-fresh/.../screen.png`.
