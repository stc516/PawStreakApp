# Discovery System

> **Plan tab** — how owners find *where* to take today's mission.

---

## Launch scope

**Local static discovery** — curated place cards on Plan screen.

- No Google Places API
- No live "near me" search
- Category filters on Plan (`AdventurePage` plan mode)

---

## UX flow

1. Today mission sets emotional intent (category / vibe)
2. Plan shows **{Category} Spots** list
3. User taps **Start** on a place card → active walk
4. Header `adventure-send-off` shows `locationHint` or mission title

---

## Categories

`AdventureCategory`: `social` | `exploration` | `chill` | `chaos` | `routine`

Mapped from mission / UI chips — not exposed as raw enums to users.

---

## ZIP influence

Locale from [localization-system.md](./localization-system.md) shapes which mission titles and hints appear — indirect discovery flavor.

---

## Deferred

| Feature | Stitch reference |
|---------|------------------|
| Bailey's discoveries | `bailey_s_discoveries` |
| Live maps | — |
| Community recommendations | `community_feed` |

---

## TODO

- [ ] Document `places` array source in `AdventurePage.tsx`
- [ ] Wire favorite places from Profile when settings ship

---

## Related

- [recommendation-system.md](./recommendation-system.md)
- [deferred-features.md](../launch/deferred-features.md)
