# Memory System

---

## Data model

`AdventureEntry` — `src/types/index.ts`

| Field | Purpose |
|-------|---------|
| `missionTitle`, `emoji`, `locationHint` | Card display |
| `memoryText` | Owner capture on active walk |
| `completedAt` | Timeline sorting |
| `rarity`, `adventureEnergy` | Flavor + progression |

Stored in `state.recentAdventures[]` — appended by `completeAdventure()`.

**Privacy:** `memoryText` stays local; not sent to analytics per type comment.

---

## Capture UI

Active adventure: `adventure-memory-input` — `AdventurePage.tsx`

Completion modal: `adventure-complete-memory`  
Reward: `reward-memory-card`

---

## Journey (`/story`)

`StoryPage.tsx`:

- Groups by month
- Card tap → `MemoryDetailSheet` (bottom sheet, not route)
- Share via Web Share API / clipboard fallback
- Empty state → CTA to `/adventure`

**Launch rule:** No fabricated demo rows (e.g. removed "Annual Checkup" placeholder).

---

## Today strip

`dashboard-recent-memories` — horizontal scroll of recent entries or empty state.

---

## Share

`src/lib/shareAdventure.ts` — used in completion modal and memory sheet.

E2E: Share Adventure flow does not crash.

---

## TODO

- [ ] Photo attachments on memories (Stitch `memory_sunset_at_coronado` reference)
- [ ] Export / print memory book

---

## Related

- [core-loop.md](../product/core-loop.md)
- [emotional-context-engine.md](./emotional-context-engine.md)
