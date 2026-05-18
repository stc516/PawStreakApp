# Streak System

---

## State fields

`PawstreakState` (`src/types/index.ts`):

| Field | Meaning |
|-------|---------|
| `currentStreak` | Consecutive days with completed adventure |
| `longestStreak` | All-time best |
| `todayAdventureDone` | Boolean gate for today |
| `totalAdventures` | Lifetime count |

Updated in `completeAdventure()` — `src/lib/pawstreakState.ts`

---

## Rules (launch)

> **TODO:** Document exact calendar-day boundary logic (local timezone) from `completeAdventure` implementation — verify edge case at midnight.

Expected behavior:

- Completing a walk marks today done
- Missing a day resets `currentStreak` (verify in code before marketing "streak" copy)

---

## UI surfaces

| Surface | Element |
|---------|---------|
| Today | `dashboard-streak-summary` |
| Path | tier progression tied to total energy / adventures |
| Reward | optional mini XP/streak block — `reward-progress-block` |

---

## Emotional framing

Streak is **companionship rhythm**, not competitive leaderboard.

Copy: gentle, never punitive ("You failed").

---

## Related

- [progression-system.md](./progression-system.md)
- [core-loop.md](../product/core-loop.md)
