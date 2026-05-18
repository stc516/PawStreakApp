# Target User

---

## Primary persona: **The Devoted Daily Walker**

| Attribute | Detail |
|-----------|--------|
| Relationship | Dog is family, not "a pet" |
| Behavior | Walks 1–2× daily, often same neighborhoods |
| Motivation | Guilt-free joy, memory, routine — not competition |
| Tech comfort | iPhone-first; will install PWA if emotional payoff is clear |
| Geography | Launch-tuned for San Diego ZIPs (`921xx` coastal pools); works generically elsewhere |

---

## Jobs to be done

1. **"What should we do today?"** → Today + chips + mission card
2. **"Make this walk special"** → Plan spots + active milestone copy
3. **"Remember this"** → Memory note + Journey timeline
4. **"Don't lose our progress"** → Optional account save (Supabase)

---

## Not primary (launch)

- Professional dog walkers managing clients
- Agility/competition trainers optimizing metrics
- Social influencers building audience

> **TODO:** Validate persona with 5–8 owner interviews post-launch; update ZIP/locale priorities.

---

## Onboarding signals we capture

Stored in `PawstreakState` (`src/types/index.ts`):

- `dogProfile.personality` — Social Butterfly, Trail Sniffer, etc.
- `dogProfile.energyLevel`
- `ownerProfile.goals`
- `userProfile.homeZip` → drives `localeFromZip()` in `src/data/localAdventureEngine.ts`

---

## Related

- [product-thesis.md](./product-thesis.md)
- [systems/localization-system.md](../systems/localization-system.md)
