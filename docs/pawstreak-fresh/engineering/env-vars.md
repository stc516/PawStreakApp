# Environment Variables

> **Template:** `.env.example` at repo root  
> **Local:** copy to `.env.local` (gitignored)

---

## Required for production auth/sync

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key (RLS-protected) |

If both empty → demo-only localStorage mode.

---

## Optional

| Variable | Description |
|----------|-------------|
| `VITE_FORCE_DEMO_MODE` | `"true"` forces demo even if Supabase keys exist |
| `VITE_SENTRY_DSN` | Error monitoring (no PII — see `errorMonitoring.ts`) |
| `VITE_POSTHOG_KEY` | Product analytics |
| `VITE_POSTHOG_HOST` | Default `https://us.i.posthog.com` |

---

## Access in code

```typescript
import.meta.env.VITE_SUPABASE_URL
```

Only `VITE_*` vars are exposed to the client bundle.

---

## Never commit

- `.env.local`
- Service role keys
- PostHog personal API keys

---

## Vercel

Set per environment (Production / Preview) in Project Settings → Environment Variables.

See [vercel.md](./vercel.md).

---

## Related

- [deployment.md](./deployment.md)
