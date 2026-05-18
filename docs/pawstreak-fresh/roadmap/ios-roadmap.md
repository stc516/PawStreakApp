# iOS Roadmap

---

## Strategy

**PWA first, native when the ritual is proven.**

The Fresh web app validates emotional loop and copy. Native adds: push, background location, Camera roll, App Store distribution.

---

## Phase 0 (now)

- Installable PWA via Safari Add to Home Screen
- Safe areas via CSS `env(safe-area-inset-*)`
- 390px-first layouts map cleanly to iPhone viewport

---

## Phase 1 — Capacitor shell (candidate)

Wrap existing `dist/` in Capacitor:

- [ ] Single codebase maintenance
- [ ] Native plugins: push, haptics, status bar
- [ ] App Store listing

> **TODO:** Spike repo folder `ios/` with Capacitor 6 + Vite build hook.

---

## Phase 2 — SwiftUI hybrid (optional)

If performance or Apple UX requirements exceed WebView:

- Native shell: nav + notifications
- WebView or React Native Fabric for content screens

Only after PWA metrics justify investment.

---

## Design continuity

Import [cinematic-direction.md](../brand/cinematic-direction.md) — amber on ink transfers directly to iOS dark mode.

---

## App Store considerations

- Privacy nutrition labels — align with [PrivacyPage.tsx](../../src/pages/PrivacyPage.tsx)
- No broken links to `/packs` in review build
- Account deletion flow — **TODO** before native ship

---

## Related

- [pwa.md](../engineering/pwa.md)
- [backend-roadmap.md](./backend-roadmap.md)
