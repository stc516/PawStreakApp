# Anti-Patterns

> Explicit list to prevent drift. If you're about to do one of these, stop and read [guiding-light.md](./guiding-light.md).

---

## Product anti-patterns

| Anti-pattern | Why it fails | Instead |
|--------------|--------------|---------|
| Dashboard of widgets | Feels like work | One hero mission + memories strip |
| Community feed in nav | Unfinished social = trust leak | Hide until system exists |
| XP / leaderboard headline | Breaks dog-first tone | Adventure energy as soft progression |
| Fake demo data in Journey | Breaks trust when empty | Real empty states |
| Weather header without real API | Placeholder UI | Hide until wired |

---

## Engineering anti-patterns

| Anti-pattern | Why it fails | Instead |
|--------------|--------------|---------|
| New route per modal | Router sprawl | Sheet / overlay (`StoryPage` memory sheet) |
| Decorative `onClick` | Launch QA failure | Hide control |
| Breaking `data-testid` | Regresses e2e | Update test in same PR |
| Backend for mission copy | Slows iteration | `localAdventureEngine.ts` |
| Seeding fake adventures on fresh install | Violates empty-state principle | `DashboardPage` empty memories |

---

## Design anti-patterns

| Anti-pattern | Why it fails | Instead |
|--------------|--------------|---------|
| Light mode cards on dark app | Breaks cinematic feel | Cinematic Amber surfaces |
| Sharp 4px corners on hero | Feels utilitarian | 16–24px radii, pills for chips |
| Multiple accent colors | Visual noise | Amber gradient family only |
| Stock "pet app" illustrations | Generic | Stitch photography + mascot scenes |

---

## Copy anti-patterns

- "Congratulations, user!"
- "Level up!"
- "Enable notifications now!!!"
- Park/beach **category labels** as primary mission framing (vibes are hidden mechanics)

---

## Launch violations (current code avoids these)

Hidden routes still exist but are **not linked** from main UX:

- `/packs`, `/badges` — see [deferred-features.md](../launch/deferred-features.md)

---

## Related

- [launch/deferred-features.md](../launch/deferred-features.md)
- [design/stitch-canon.md](../design/stitch-canon.md)
