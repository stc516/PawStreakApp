# Repo Structure

---

## Top level

```
pawstreakapp/
├── src/                    # Application source (ship this)
├── design/stitch-fresh/    # Stitch HTML + PNG canon
├── tests/e2e/              # Playwright specs
├── docs/pawstreak-fresh/   # This documentation system
├── scripts/                # PWA icons, screenshots
├── public/                 # Static assets, manifest
├── screenshots/launch/     # Generated QA captures
└── playwright.config.ts
```

---

## `src/` layout

```
src/
├── main.tsx
├── index.css
├── pages/              # Route-level screens
├── components/         # Shared UI (nav, auth, legal)
├── components/providers/
│   └── AppStateProvider.tsx
├── hooks/
│   ├── useAppState.tsx
│   ├── useSession.tsx
│   └── usePawstreakState.ts
├── lib/                # Core logic, router, clients
├── data/               # Mission engine, zip environments
├── types/index.ts      # PawstreakState and domain types
├── content/            # Mascot scenes, guidelines
└── assets/             # Images, mascot
```

---

## Do not edit for app behavior

| Path | Reason |
|------|--------|
| Root `DashboardPage.tsx`, etc. | Stray duplicates — excluded in `eslint.config.js` |
| `stitch_pawstreak_mobile_ui_system */` | Export duplicates |
| `bailey-os.jsx` | Prototype sandbox |

---

## Naming conventions

| Type | Pattern | Example |
|------|---------|---------|
| Pages | `*Page.tsx` | `DashboardPage.tsx` |
| State actions | verb in `pawstreakState.ts` | `completeAdventure` |
| Testids | kebab-case | `dashboard-gm-title` |
| Storage key | versioned | `pawstreak_demo_state_v4` |

---

## Related

- [routing-system.md](./routing-system.md)
