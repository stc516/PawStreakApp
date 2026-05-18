# Stitch Canon

> **Authoritative visual reference** for PawStreak Fresh. Code should converge toward these files, not the reverse.

---

## Root path

```
design/stitch-fresh/stitch_pawstreak_mobile_ui_system/
```

Duplicate copies may exist under `src/ui-reference*` — treat **`design/stitch-fresh`** as canonical for new work.

---

## Structure per screen

```
{screen_name}/
  code.html    # Tailwind/HTML reference implementation
  screen.png   # Pixel reference for QA
```

---

## Design system file

```
cinematic_amber/DESIGN.md
```

YAML frontmatter: colors, typography, spacing, radii.

---

## Launch-aligned screens

| Stitch folder | App implementation |
|---------------|-------------------|
| `today_app` / `today_app_fix` | `DashboardPage.tsx` |
| `plan_discovery_adventure` / `plan_adventure_fix` | `AdventurePage.tsx` (plan mode) |
| `active_adventure_adventure_live` | `AdventurePage.tsx` (active mode) |
| `reward_celebration` | `RewardPage.tsx` |
| `journey_story` | `StoryPage.tsx` |
| `path_wild` | `TheWildPage.tsx` |
| `profile_account` | `AccountPage.tsx` |
| Onboarding `onboarding_*` | `OnboardingPage.tsx` |

---

## Explicitly NOT launch (reference only)

| Stitch folder | Status |
|---------------|--------|
| `community_feed` | Hidden |
| `journal_entry` | Hidden |
| `settings` (deep) | Hidden |
| `bailey_s_discoveries` | Exploratory |

---

## Workflow for designers

1. Open `screen.png` side-by-side with running app (`npm run dev`).
2. Diff spacing, type size, and CTA placement — not feature set.
3. If Stitch and [launch/deferred-features.md](../launch/deferred-features.md) conflict, **deferred doc wins** for scope.

---

## Overview doc

`pawstreak_screens_overview_shareable.md` — high-level flow narrative (may reference legacy screen IDs).

---

## Screenshots for marketing

Script: `scripts/capture-launch-screenshots.mjs`  
Output: `screenshots/launch/`
