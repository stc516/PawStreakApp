# Deferred Features

> **Launch rule:** Hidden from main UX. Routes may exist; nav and CTAs must not expose.

---

## Hidden systems

| Feature | Route / code | Why deferred |
|---------|--------------|--------------|
| Community feed | Stitch `community_feed` | No social graph, moderation, or trust model |
| Packs / Regions | `/packs`, `PacksPage.tsx` | Meta-game unfinished; copy removed from save prompts |
| Deep Settings | Stitch `settings` | Notification prefs, account management not ready |
| Journal compose | Stitch `journal_entry` | Compose + sync story not built |
| Full weather / location | Was on Today header | No real API — removed to avoid placeholder UI |
| Badges gallery | `/badges` | Secondary to Journey memory |

---

## Partial implementations (do not expand pre-launch)

| Feature | Current state |
|---------|---------------|
| Path tiers | Visual progression on `TheWildPage` — not full pack mechanics |
| Away detection | `evaluateAwayFromCoords` — no UI surface |
| Google sign-in | Onboarding button → note only |

---

## Preferred patterns when building deferred work

| Instead of… | Use… |
|-------------|------|
| New route for detail | Bottom sheet (`MemoryDetailSheet` pattern) |
| New nav tab | Sub-section of existing tab |
| Backend-first | Local engine + sync later |

---

## Re-enable checklist (per feature)

- [ ] Stitch screen updated and approved
- [ ] Core loop still ≤ 5 nav tabs
- [ ] No dead buttons
- [ ] E2E coverage
- [ ] Privacy review (if PII or social)
- [ ] Update this doc — remove from deferred list

---

## Related

- [anti-patterns.md](../product/anti-patterns.md)
- [post-launch-roadmap.md](../roadmap/post-launch-roadmap.md)
