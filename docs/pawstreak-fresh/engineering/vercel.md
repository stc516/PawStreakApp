# Vercel

---

## Project setup

1. Import GitHub repo to Vercel
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`

---

## Environment variables

Copy from `.env.example` into Vercel → Settings → Environment Variables:

| Var | Environments |
|-----|----------------|
| `VITE_SUPABASE_URL` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview |
| `VITE_SENTRY_DSN` | Production |
| `VITE_POSTHOG_KEY` | Production |

Use Preview-specific Supabase project if isolating test data.

---

## Preview deployments

Every PR should get a Preview URL for design QA against Stitch.

**Caution:** Preview without Supabase = demo mode only.

---

## Custom domain

Configure in Vercel → Domains. Ensure HTTPS automatic.

PWA install prompts require secure origin.

---

## Performance

- Enable compression (default)
- Consider `Cache-Control` for hashed assets in `dist/assets/`

> **TODO:** Add `vercel.json` headers block if cache tuning needed.

---

## Related

- [deployment.md](./deployment.md)
- [env-vars.md](./env-vars.md)
