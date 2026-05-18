# Known Issues

> Accepted at launch — track fixes post-ship.

---

## UX / polish

| Issue | Impact | Workaround |
|-------|--------|------------|
| Character moment not Stitch-aligned | Medium visual inconsistency | Short transition; users tap through |
| Design tokens duplicated per page | Designer/dev drift risk | Follow `cinematic_amber/DESIGN.md` |
| Inline styles vs Tailwind mix | Harder theming | Do not refactor pre-launch without reason |

---

## Data / state

| Issue | Impact | Notes |
|-------|--------|-------|
| ~~`seedEntries()` demo adventures on fresh install~~ | Fixed — `completeOnboarding()` resets progress | Legacy localStorage may still have old demo data until cleared |
| Geolocation optional / silent fail | `isAway` may stay false | No user-facing weather yet |

---

## Auth

| Issue | Impact | Notes |
|-------|--------|-------|
| Google onboarding stub | Users see "coming soon" | Expected |
| E2E assumes local OR configured Supabase | CI env must match | See account test |

---

## Infrastructure

| Issue | Impact | Notes |
|-------|--------|-------|
| No unit test suite | Logic regressions caught late | e2e covers main flow only |
| Supabase schema not in repo | Onboarding eng friction | **TODO:** add migrations |

---

## Repo hygiene

| Issue | Impact |
|-------|--------|
| Duplicate Stitch zip folders at root | Clutter |
| Root-level stray `*Page.tsx` | Confusing — excluded from eslint |

---

## Reporting new issues

Add row here + link GitHub issue. Classify: **blocker** vs **post-launch**.
