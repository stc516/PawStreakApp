# Dog-First Philosophy

---

## Core belief

**The dog is the protagonist. The human is the narrator.**

PawStreak exists to honor the dog's daily life — not to optimize the owner's productivity.

---

## Product implications

| Decision | Dog-first choice |
|----------|------------------|
| Headline after walk | "Bailey had a great day" |
| Stats secondary | Memory text + location hint first |
| Notifications (future) | "Bailey's ready for an adventure" not "Complete your task" |
| Onboarding | Name the dog before account email |

---

## Code touchpoints

- `state.dogName` threaded through `RewardPage`, completion modal, `StoryPage`
- `adventureDisplayTitle.ts` — central headline helper
- Analytics contract: **no dog name** in third-party tools (`analytics.ts`)

---

## Copy audit checklist

- [ ] Is the dog the grammatical subject?
- [ ] Would this sentence still make sense if the dog could read it?
- [ ] Does it avoid guilt / shame for missed days?

---

## Anti-patterns

See [anti-patterns.md](../product/anti-patterns.md) — especially leaderboard and "you failed" framing.

---

## Related

- [brand-voice.md](./brand-voice.md)
- [guiding-light.md](../product/guiding-light.md)
