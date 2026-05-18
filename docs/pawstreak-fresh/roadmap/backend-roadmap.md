# Backend Roadmap

---

## Launch architecture

**Thick client, thin server.**

| Concern | Launch | Future |
|---------|--------|--------|
| Mission text | `localAdventureEngine.ts` | Optional server packs |
| State | localStorage + Supabase row | Real-time sync |
| Auth | Supabase Auth | OAuth providers |
| Analytics | PostHog client | Server-side events |
| Media | None | S3 / Supabase Storage |

---

## Supabase (now)

- Auth + JSON state blob per user
- See [supabase-architecture.md](../engineering/supabase-architecture.md)

> **TODO:** Add `supabase/migrations/` with:
> - `profiles` table
> - `pawstreak_state` jsonb column
> - RLS: `auth.uid() = user_id`

---

## Phase 1 API (when needed)

| Endpoint | Purpose |
|----------|---------|
| `POST /missions/daily` | Server-driven missions for A/B copy |
| `GET /places?zip=` | Curated places CDN cache |
| `POST /memories` | Photo upload + backup |

Prefer **Edge Functions** on Supabase before standalone Node service.

---

## Phase 2 scale

- CDN for Stitch assets / dog photography
- Background jobs: streak reminders (respect `notificationPrefs`)
- Rate limiting on auth endpoints

---

## Principles

1. **Offline-first** — server enhances, never blocks walk completion
2. **Privacy** — no selling location trails
3. **Dog-first payloads** — APIs return mission flavor, not leaderboard ranks

---

## Related

- [supabase-architecture.md](../engineering/supabase-architecture.md)
- [monetization-thoughts.md](./monetization-thoughts.md)
