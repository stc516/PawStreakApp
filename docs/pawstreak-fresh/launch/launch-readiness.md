# Launch Readiness

> **Verdict (Fresh track):** Core loop **launch-ready** with documented polish debt.

---

## Go criteria

| Gate | Status |
|------|--------|
| Onboarding → first completion | ✅ E2E |
| Five-tab nav, no blank screens | ✅ E2E |
| Today chips update mission | ✅ E2E |
| Dead decorative controls hidden | ✅ |
| Journey real memories + sheet | ✅ |
| `npm run build` | ✅ |
| `npm run test:e2e` (17 tests) | ✅ |
| Lint clean (`src/`) | ✅ |

---

## No-go until resolved

| Item | Severity |
|------|----------|
| Broken core loop | Blocker |
| Visible non-functional CTAs | Blocker |
| Console errors on main flow | Blocker — e2e `no console errors` |
| Exposed community/packs/settings | Blocker — trust |

---

## Polish debt (ship allowed)

| Item | Notes |
|------|-------|
| `/character-moment` | Functional, not Stitch-polished |
| Token consolidation | Inline `C` objects per page |
| Root duplicate `.tsx` files | Ignored by eslint |
| Seed demo data in state | Fresh installs may still seed — verify product intent |

See [known-issues.md](./known-issues.md).

---

## Stakeholder sign-off

- [ ] Product — scope per [deferred-features.md](./deferred-features.md)
- [ ] Design — Stitch diff on 6 launch screens
- [ ] Engineering — e2e green on main
- [ ] Legal — Privacy/Terms linked

---

## Related

- [qa-checklist.md](./qa-checklist.md)
- [launch-day-checklist.md](./launch-day-checklist.md)
