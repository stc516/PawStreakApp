# Progression System

---

## Currencies (launch)

| Currency | User-facing name | Notes |
|----------|------------------|-------|
| `adventureEnergy` | Soft energy / warmth | Per walk, in `AdventureEntry` |
| `totalAdventureEnergy` | Lifetime | Path tiers |
| Streak | Days in a row | [streak-system.md](./streak-system.md) |

**Not launch headline:** raw XP jargon — see `src/lib/xp.ts` for internal calculation.

---

## Path screen (`/wild`)

`TheWildPage.tsx` — Stitch **Path**

- `wild-current-card` — dog + current tier narrative
- `wild-tier-1` … `wild-tier-6` — nodes with `data-current` on active tier

Hidden: `wild-coming-soon` (display:none) for legacy e2e compatibility.

---

## Badges

`BadgeDefinition[]` in state — `/badges` route exists but **not in nav**.

> **TODO:** Align badge unlock rules with Journey milestones post-launch.

---

## Packs (deferred)

`src/lib/monthlyPacks.ts`, `PacksPage.tsx` — region identity meta-game. **Deferred** — see [deferred-features.md](../launch/deferred-features.md).

---

## Level utils

`src/utils/xpLevels.ts`, `src/lib/gamification.ts` — support cards; do not surface heavy leveling UI at launch.

---

## Related

- [streak-system.md](./streak-system.md)
- [memory-system.md](./memory-system.md)
