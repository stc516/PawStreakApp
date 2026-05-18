# Emotional Context Engine

> How PawStreak picks the *feeling* of today before the *place*.

---

## Inputs

| Input | Source | Refresh |
|-------|--------|---------|
| `dogMood` | `moodForDay()` hash on date | Daily (`moodDayKey`) |
| `dogProfile.personality` | Onboarding | Static |
| `dogProfile.energyLevel` | Onboarding | Static |
| `isAway` | Geolocation vs home | Per session |
| `selectedVibe` | User chip or pick | Per interaction |

Files: `src/data/missions.ts`, `src/lib/pawstreakState.ts`

---

## Outputs

`GeneratedMission` fields:

- `description` — short emotional line
- `flavor` — mood + rarity sentence
- `moodMatchesToday` — boolean for UI emphasis
- `idealMoods[]` — mission tuning

---

## Daily mood

```typescript
// moodDayKey: YYYY-MM-DD
dogMood: 'restless' | 'curious' | 'explorer' | 'social' | 'zoomie' | 'chill'
```

Rotates deterministically — same dog sees consistent mood within a calendar day.

---

## Active walk copy

`AdventurePage.tsx`:

- `adventure-milestone-eyebrow`
- `adventure-milestone-line`

Driven by mission category + milestone helpers in `src/lib/adventureMilestones.ts`.

---

## Completion copy

`adventureDisplayTitle.ts` + memory text → Reward headline

Pattern: `{dogName} had a great day.`

---

## TODO

- [ ] Rainy-day Stitch variant (`today_rainy_day_mood`) — wire weather signal when API exists
- [ ] Explicit mood picker on Today (currently chips map to vibe, not mood enum)

---

## Related

- [recommendation-system.md](./recommendation-system.md)
- [emotional-copywriting.md](../design/emotional-copywriting.md)
