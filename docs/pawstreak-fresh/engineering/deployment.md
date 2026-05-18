# Deployment

---

## Build pipeline

```bash
npm run build   # tsc -b && vite build → dist/
```

Artifacts: static files in `dist/` suitable for any static host.

---

## Pre-ship checklist

- [ ] `npm run lint` clean
- [ ] `npm run build` clean
- [ ] `npm run test:e2e` green
- [ ] Env vars set on host
- [ ] Supabase RLS verified (if using auth)

---

## Hosting (recommended)

**Vercel** — see [vercel.md](./vercel.md)

Alternatives: Netlify, Cloudflare Pages, S3+CloudFront (same static output).

---

## SPA routing

All paths must rewrite to `index.html` for client-side routing.

Vercel: `vercel.json` rewrites (if present) or framework preset.

---

## PWA assets

Generate icons: `npm run icons` → `scripts/generate-pwa-icons.mjs`

Manifest: `public/manifest.webmanifest` (verify path in build).

---

## Post-deploy smoke

1. Fresh incognito → onboarding → complete walk
2. Journey shows new memory
3. Profile loads without console errors

---

## Rollback

See [launch/rollback-plan.md](../launch/rollback-plan.md).
