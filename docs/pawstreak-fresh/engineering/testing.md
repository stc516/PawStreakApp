# Testing

---

## E2E (primary gate)

**Runner:** Playwright  
**Config:** `playwright.config.ts`  
**Specs:** `tests/e2e/pawstreak.spec.ts`

```bash
npm run test:e2e          # headless
npm run test:e2e:ui       # debug UI
npm run test:e2e:headed   # visible browser
```

### Web server

Playwright starts:

```
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

Viewport: 390×844 mobile chromium.

---

## Helpers

| Helper | Purpose |
|--------|---------|
| `completeOnboarding(page, { dogName, zip })` | Full `/` flow |
| `enterActiveAdventure(page)` | Today → Plan → Start → active |

**Critical:** Adventure tests must call `enterActiveAdventure` before **Wrap adventure**.

---

## Key testids (maintain these)

| testid | Screen |
|--------|--------|
| `bottom-nav` | Nav shell |
| `dashboard-start-adventure-cta` | Today primary CTA |
| `dashboard-gm-title` | Mission title (chip test) |
| `adventure-send-off` | Active header |
| `adventure-complete-modal` | Completion dialog |
| `reward-headline` | Reward |
| `wild-tier-1`…`6` | Path |
| `account-page` | Profile |
| `save-progress-nudge` | Auth nudge |

---

## Lint / typecheck

```bash
npm run lint    # eslint
npm run build   # tsc -b + vite
```

---

## Screenshots

```bash
# Terminal 1
npm run dev -- --host 127.0.0.1 --port 4173

# Terminal 2
node scripts/capture-launch-screenshots.mjs
```

Output: `screenshots/launch/*.png`

---

## TODO

- [ ] Unit tests for `pawstreakState.ts` pure functions
- [ ] Visual regression against Stitch PNGs (Playwright snapshot or Percy)

---

## Related

- [launch/qa-checklist.md](../launch/qa-checklist.md)
