# Navigation System

---

## Bottom navigation (launch canon)

**File:** `src/components/BottomNav.tsx`  
**Testid:** `bottom-nav`

| Label | Route | Icon key | Page component |
|-------|-------|----------|----------------|
| Today | `/app` | today | `DashboardPage.tsx` |
| Plan | `/adventure` | plan | `AdventurePage.tsx` |
| Journey | `/story` | journey | `StoryPage.tsx` |
| Path | `/wild` | path | `TheWildPage.tsx` |
| Profile | `/account` | profile | `AccountPage.tsx` |

> **Do not rename tabs or reorder** without product + e2e update.

---

## Routes outside nav (hidden or secondary)

| Route | Purpose | Launch visibility |
|-------|---------|-------------------|
| `/` | Onboarding | First run only |
| `/reward` | Post-walk celebration | Flow only |
| `/character-moment` | Transition beat | Flow only |
| `/privacy`, `/terms` | Legal | Footer links |
| `/packs`, `/badges` | Legacy systems | **Hidden** — no nav link |

Router: `src/lib/router.tsx`

---

## In-flow navigation (not tabs)

```
Today --Let's go--> Plan --Start--> Active --Done--> Character moment --> Reward --Done--> Today
```

Account: `AccountStatusChip` → `/account` → `account-back` → `/app`

---

## IA rules

1. **Five tabs max** at launch.
2. **No hamburger menu** for hidden features.
3. **Back** on Profile returns to Today, not browser history stack.
4. Plan and Active are the **same route** (`/adventure`) with `planMode` state — not separate URLs.

---

## E2E coverage

`bottom nav visits core tabs without blank screens` — `pawstreak.spec.ts`

---

## Related

- [screen-canon.md](./screen-canon.md)
- [routing-system.md](../engineering/routing-system.md)
