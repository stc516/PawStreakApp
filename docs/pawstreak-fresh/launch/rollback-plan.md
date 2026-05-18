# Rollback Plan

---

## Triggers

Roll back immediately if:

- Onboarding or completion loop broken for >50% of users
- Auth corrupts or wipes local state
- PII leaked to analytics/monitoring
- Site unavailable or critical JS error on load

---

## Vercel rollback (fastest)

1. Open Vercel → Project → Deployments
2. Find last **known-good** production deployment
3. Click **⋯** → **Promote to Production**
4. Confirm domain points to promoted build

**Target time:** < 5 minutes

---

## Git rollback (if needed)

```bash
git revert <bad-commit-sha>   # preferred — preserves history
# push to main → triggers new deploy
```

Avoid `git push --force` to `main` unless emergency and team aligned.

---

## Supabase rollback

- Schema: restore from Supabase backup / point-in-time recovery
- **Do not** roll back client without checking RLS compatibility

> **TODO:** Document backup schedule once migrations exist.

---

## Feature flags (future)

> **TODO:** Add `VITE_KILL_SWITCH_*` env vars for disabling auth sync or analytics without full revert.

---

## Communication template

> We rolled back a release that affected [X]. Your local walks are safe on your device. We're redeploying a fix — ETA [Y].

---

## Post-mortem

Within 48h:

1. What broke?
2. Why didn't e2e catch it?
3. New test or checklist item?

---

## Related

- [launch-day-checklist.md](./launch-day-checklist.md)
- [known-issues.md](./known-issues.md)
