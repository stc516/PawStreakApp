# Post-Launch Roadmap

> **Horizon:** First 90 days after Fresh launch. Ordered by emotional impact, not engineering ease.

---

## Phase 1 — Harden (Weeks 1–2)

- [ ] Character moment Stitch polish (`CharacterMomentPage.tsx`)
- [ ] Consolidate design tokens (`src/theme/`)
- [ ] Supabase migrations + RLS in repo
- [ ] Unit tests for `pawstreakState.ts`
- [ ] Remove or gate `seedEntries()` for production fresh installs

---

## Phase 2 — Remember more (Weeks 3–6)

- [ ] Photo on memory capture (Stitch `memory_sunset_at_coronado`)
- [ ] PWA install prompt moment
- [ ] `isAway` traveling copy on Today
- [ ] PostHog funnels: onboarding → first walk → D7

---

## Phase 3 — Depth (Weeks 7–12)

- [ ] Packs / regions (re-enable with nav strategy review)
- [ ] Journal compose (sheet, not tab sprawl)
- [ ] Notification cadence from `notificationPrefs`
- [ ] Light community (read-only?) — only with moderation plan

---

## Explicitly later

- Native iOS — [ios-roadmap.md](./ios-roadmap.md)
- Server mission API — [backend-roadmap.md](./backend-roadmap.md)
- Monetization — [monetization-thoughts.md](./monetization-thoughts.md)

---

## How to propose work

1. Check [deferred-features.md](../launch/deferred-features.md)
2. Pass [guiding-light.md](../product/guiding-light.md) filter
3. Add Stitch reference or justify exception
