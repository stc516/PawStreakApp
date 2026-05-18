# Emotional Copywriting

---

## Voice summary

Warm. Specific. Dog-centered. Never corporate. Never shouty.

See also [brand-voice.md](../brand/brand-voice.md).

---

## Templates

| Context | Pattern | Example |
|---------|---------|---------|
| Completion headline | `{name} had a great day.` | Bailey had a great day. |
| Mission description | Sensory + mood | Short line on hero card |
| Empty Journey | Invitation | Start first walk → Plan |
| Save prompt | Protect story | Save Bailey's story |
| Milestone eyebrow | Category mood | SOCIAL · EXPLORATION |

---

## Chip labels (Today)

User-facing: **Social, Trail, Chill, Wild** (map to `VibeArchetype` in state — `pulse`, `wander`, `salt`, `wild`).

Do not expose internal vibe IDs in UI.

---

## Where copy is generated

| Source | File |
|--------|------|
| Mission title/description | `src/data/localAdventureEngine.ts` |
| Flavor lines | `src/data/missions.ts` → `flavorForMission` |
| Completion headline | `src/lib/adventureDisplayTitle.ts` |
| Reward page | `src/pages/RewardPage.tsx` |

---

## Privacy-safe copy

Never put email, exact address, or full ZIP in celebratory strings shown in screenshots or share cards.

---

## Localization

> **TODO:** i18n pipeline — all strings currently English inline in components.

---

## Anti-patterns

Listed in [anti-patterns.md](../product/anti-patterns.md).
