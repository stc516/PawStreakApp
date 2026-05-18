# State Management

---

## Core type

`PawstreakState` — `src/types/index.ts`

Key fields:

| Field | Purpose |
|-------|---------|
| `onboardingComplete` | Gate for main app |
| `dogName`, `dogProfile` | Identity |
| `zipCode`, `userProfile` | Locale / home |
| `dogMood`, `moodDayKey` | Daily emotional context |
| `generatedMission` | Today's mission card |
| `recentAdventures` | Journey timeline |
| `currentStreak`, `totalAdventureEnergy` | Progression |
| `todayAdventureDone` | Daily completion flag |

---

## Provider

`src/components/providers/AppStateProvider.tsx`

- Loads via `AppStateRepository.load()`
- Saves on every state change
- Optional `repository.hydrate()` from Supabase
- Exposes actions via `useAppState()` — `src/hooks/useAppState.tsx`

---

## Pure reducers

`src/lib/pawstreakState.ts` — all transitions as exported functions:

| Action | Trigger |
|--------|---------|
| `completeOnboarding` | End of `/` flow |
| `selectVibe` | Today chip tap |
| `rollPickForMe` | Random mission |
| `completeAdventure` | Wrap adventure + memory |
| `setZipCode` | Profile / onboarding ZIP |
| `evaluateAwayFromCoords` | Geolocation vs home |

---

## Storage

| Mode | Repository | Key |
|------|------------|-----|
| Demo | `localStorageStateRepository.ts` | `pawstreak_demo_state_v4` |
| Signed in | `supabaseStateRepository.ts` | `pawstreak_user_{id}_v4` |

---

## Mission generation

`selectVibe` and daily rolls call into:

- `src/data/localAdventureEngine.ts`
- `src/data/missions.ts`

Produces `GeneratedMission` attached to state.

---

## UI consumption example

```typescript
const { state, selectVibe, completeAdventure } = useAppState()
const gm = state.generatedMission
```

`DashboardPage.tsx` — chips call `selectVibe(vibe)`.

---

## TODO

- [ ] Document merge strategy when remote hydrate conflicts with local
- [ ] Reduce seed demo adventures for production builds (currently in `seedEntries()`)

---

## Related

- [recommendation-system.md](../systems/recommendation-system.md)
- [supabase-architecture.md](./supabase-architecture.md)
