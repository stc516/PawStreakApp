# Localization System

> **Launch reality:** Not i18n strings — **locale inference from ZIP** for mission pools.

---

## Core module

`src/data/localAdventureEngine.ts` → `localeFromZip()`

| Locale | Meaning | Example ZIPs |
|--------|---------|--------------|
| `coastal` | Salt-air missions | `921xx` San Diego |
| `trail` | Foothill / trail towns | `92025`, etc. |
| `urban` | Dense city prefixes | `100xx`, `941xx`, … |
| `suburban` | Residential | `920xx`, `928xx`, … |
| `generic` | Fallback | invalid / unknown ZIP |

Also: `src/data/zipEnvironments.ts`, `src/lib/resolveUserEnvironment.ts`

---

## User input

- Onboarding: placeholder `92107` — `OnboardingPage.tsx`
- Stored: `state.zipCode`, `userProfile.homeZip`

Unsupported ZIP (e.g. `83702`) — onboarding still completes; generic pools apply (e2e covered).

---

## Labels

`localeLabel()` — human copy like "salt-air", "home turf" — not shown as raw enum to users.

---

## Away mode

`evaluateAwayFromCoords()` in `pawstreakState.ts` sets `isAway` when far from home — influences mission flavor.

> **TODO:** Surface "traveling" copy on Today when `isAway === true`.

---

## Future i18n

> **TODO:** Extract strings to `src/i18n/en.json` + locale detector; keep ZIP engine separate from UI translation.

---

## Related

- [recommendation-system.md](./recommendation-system.md)
- [target-user.md](../product/target-user.md)
