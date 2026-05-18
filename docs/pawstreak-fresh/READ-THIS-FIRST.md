# READ THIS FIRST — PawStreak Fresh

> **Audience:** Engineers, designers, and operators joining the launch track.  
> **Source of truth:** Running app in `src/` + Stitch canon in `design/stitch-fresh/`.

---

## What PawStreak Fresh is

PawStreak Fresh is a **mobile-first PWA** that turns daily dog walks into an emotional ritual: a personalized plan, a focused active walk, a celebration, and a growing Journey of memories. It is **not** a dashboard, social network, or fitness tracker with a dog skin.

**Launch north star:** One dog, one day, one walk that feels *meant for them* — then remembered.

---

## Canonical user flow (do not break)

```
Onboarding (/) → Today (/app) → Plan (/adventure) → Active walk → Complete →
Character moment (/character-moment) → Reward (/reward) → Today
```

**Bottom nav (only these five):** Today · Plan · Journey · Path · Profile  
→ `src/components/BottomNav.tsx`

---

## Where things live

| You need… | Go to… |
|-----------|--------|
| Full doc index | [INDEX.md](./INDEX.md) |
| Product intent | [product/guiding-light.md](./product/guiding-light.md) |
| Stitch screens | [design/stitch-canon.md](./design/stitch-canon.md) |
| Routes | [engineering/routing-system.md](./engineering/routing-system.md) |
| State / missions | [engineering/state-management.md](./engineering/state-management.md) |
| Launch gates | [launch/launch-readiness.md](./launch/launch-readiness.md) |
| What we hid for launch | [launch/deferred-features.md](./launch/deferred-features.md) |

---

## Repo map (30-second version)

```
src/
  pages/           # Screen components (DashboardPage = Today, etc.)
  components/      # BottomNav, auth nudges, legal, shared UI
  lib/             # State, router, Supabase, analytics
  data/            # Local mission engine (no backend required for core loop)
  hooks/           # useAppState, useSession
design/stitch-fresh/stitch_pawstreak_mobile_ui_system/   # HTML + PNG canon
tests/e2e/pawstreak.spec.ts                             # Launch regression suite
docs/pawstreak-fresh/                                     # You are here
```

---

## Rules for contributors (non-negotiable)

1. **No new routes** unless product explicitly approves — prefer sheets, modals, local state (`launch/deferred-features.md`).
2. **Hide dead buttons** — if it does not work meaningfully, it must not ship visible.
3. **Dog-first copy** — `{dogName} had a great day`, not “You earned 50 XP.”
4. **Stitch alignment** — Cinematic Amber, 390px phone frame, amber glow — not generic SaaS UI.
5. **Preserve `data-testid`** on flows covered by e2e before merging.
6. **Do not expose** Community, Packs explorer, deep Settings, journal compose, or full weather stacks at launch.

---

## Local dev (5 minutes)

```bash
cp .env.example .env.local   # optional Supabase keys
npm install
npm run dev                  # http://localhost:5173
npm run test:e2e             # Playwright (starts dev on :4173)
```

See [engineering/env-vars.md](./engineering/env-vars.md) and [engineering/testing.md](./engineering/testing.md).

---

## First tasks by role

### Engineer
1. Read [engineering/architecture.md](./engineering/architecture.md) + [engineering/state-management.md](./engineering/state-management.md)
2. Run e2e green locally
3. Trace `selectVibe` → `generatedMission` → Adventure completion

### Designer
1. Read [design/stitch-canon.md](./design/stitch-canon.md) + [design/screen-canon.md](./design/screen-canon.md)
2. Compare your mock to `design/stitch-fresh/.../screen.png` before proposing UI changes
3. Read [brand/dog-first-philosophy.md](./brand/dog-first-philosophy.md)

### Operator / PM
1. [launch/launch-readiness.md](./launch/launch-readiness.md)
2. [launch/qa-checklist.md](./launch/qa-checklist.md)
3. [roadmap/post-launch-roadmap.md](./roadmap/post-launch-roadmap.md)

---

## Questions?

If docs and code disagree, **code wins** — update the doc in the same PR.
