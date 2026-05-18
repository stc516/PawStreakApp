# PWA

---

## Status

PawStreak ships as an installable **Progressive Web App** — mobile-first, home-screen capable.

---

## Key files

| File | Purpose |
|------|---------|
| `public/manifest.webmanifest` | Name, icons, display mode |
| `src/lib/pwaInstall.ts` | `beforeinstallprompt` listeners |
| `scripts/generate-pwa-icons.mjs` | Icon generation (`npm run icons`) |

Initialized in `src/main.tsx` → `registerPwaInstallListeners()`.

---

## Install UX

> **TODO:** Surface install prompt in Profile or post-second-walk moment (not implemented at Fresh launch).

---

## Requirements for installability

- HTTPS (Vercel production ✅)
- Valid manifest + icons
- Service worker — **verify** if registered in Vite PWA plugin or custom SW

> **TODO:** Document service worker strategy (cache-first for shell vs network-first for API).

---

## iOS notes

- Add to Home Screen works; push notifications limited
- Safe area: `env(safe-area-inset-bottom)` on `BottomNav`

See [ios-roadmap.md](../roadmap/ios-roadmap.md).

---

## Related

- [deployment.md](./deployment.md)
