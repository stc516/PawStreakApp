# Routing System

> **File:** `src/lib/router.tsx`

---

## Route table

| Path | Component | Nav visible |
|------|-----------|-------------|
| `/` | `OnboardingPage` | — |
| `/app` | `DashboardPage` (Today) | ✅ |
| `/adventure` | `AdventurePage` | ✅ |
| `/story` | `StoryPage` | ✅ |
| `/wild` | `TheWildPage` (Path) | ✅ |
| `/account` | `AccountPage` | ✅ |
| `/reward` | `RewardPage` | flow |
| `/character-moment` | `CharacterMomentPage` | flow |
| `/privacy` | `PrivacyPage` | footer |
| `/terms` | `TermsPage` | footer |
| `/packs` | `PacksPage` | ❌ hidden |
| `/badges` | `BadgesPage` | ❌ hidden |
| `*` | redirect → `/` | — |

---

## Guards

Pages check `state.onboardingComplete` and redirect to `/` if false:

- `DashboardPage`, `AdventurePage`, `StoryPage`, `TheWildPage`, etc.

Pattern:

```typescript
useEffect(() => {
  if (!state.onboardingComplete) navigate('/', { replace: true })
}, [navigate, state.onboardingComplete])
```

---

## Plan vs Active (same URL)

`/adventure` uses **local React state** `planMode` — not child routes.

- `planMode === true` → Plan UI (place list)
- `planMode === false` → Active walk UI

**Do not add `/adventure/active` without product approval.**

---

## Navigation API

- Declarative: `<NavLink>` in `BottomNav.tsx`
- Imperative: `useNavigate()` from `react-router-dom`

---

## Adding routes (gated)

Requires:

1. Product sign-off
2. Stitch reference or explicit exception
3. E2E update
4. Entry in [screen-canon.md](../design/screen-canon.md)

Prefer sheets: see `StoryPage` `MemoryDetailSheet`.

---

## Related

- [navigation-system.md](../design/navigation-system.md)
