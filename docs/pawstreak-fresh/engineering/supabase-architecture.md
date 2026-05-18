# Supabase Architecture

---

## Client

`src/lib/supabaseClient.ts`

- Creates client only when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set
- `VITE_FORCE_DEMO_MODE=true` forces null client (UI-only work)
- `isSupabaseConfigured()` used by Account and auth components

---

## Auth storage

```typescript
auth: {
  storageKey: 'pawstreak-auth',
  persistSession: true,
  detectSessionInUrl: true,
}
```

Session hook: `src/hooks/useSession.tsx`

---

## State sync

`src/lib/supabaseStateRepository.ts` implements `AppStateRepository`:

| Method | Behavior |
|--------|----------|
| `load()` | Local cache first |
| `save()` | Write local + async remote |
| `hydrate()` | Pull remote row for user |

Interface: `src/lib/stateRepository.ts`

---

## Security model (launch)

- **Anon key only** in frontend — never service role in Vite bundle
- Row-level security expected on Supabase tables (verify in Supabase dashboard)

> **TODO:** Document exact table schema and RLS policies in repo (`supabase/migrations/` when added).

---

## Degraded mode

When Supabase absent:

- App runs on localStorage
- Account page shows auth form OR `account-auth-not-configured` messaging
- E2E handles both: `account status chip routes to profile`

---

## Related

- [auth-flow.md](./auth-flow.md)
- [env-vars.md](./env-vars.md)
