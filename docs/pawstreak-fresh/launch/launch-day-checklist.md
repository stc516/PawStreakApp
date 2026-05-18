# Launch Day Checklist

---

## T-24 hours

- [ ] `npm run test:e2e` green on `main`
- [ ] Production env vars verified in Vercel
- [ ] Supabase production project + RLS smoke test
- [ ] Privacy/Terms URLs live
- [ ] Sentry / PostHog receiving events (if enabled)
- [ ] Rollback commit identified — [rollback-plan.md](./rollback-plan.md)

---

## Deploy

- [ ] Merge release PR
- [ ] Vercel production deploy complete
- [ ] Custom domain resolves + HTTPS
- [ ] PWA manifest loads (`/manifest.webmanifest`)

---

## T+0 smoke (production)

- [ ] Fresh onboarding on real phone
- [ ] Complete one walk end-to-end
- [ ] Journey shows memory
- [ ] Sign-in (if Supabase prod enabled)
- [ ] No console errors

---

## Communications

- [ ] App URL shared with beta list
- [ ] Support channel ready (email / Discord)
- [ ] Known limitations doc link ready — [known-issues.md](./known-issues.md)

---

## Monitoring (first 4 hours)

- [ ] Sentry error rate baseline
- [ ] PostHog funnel: onboarding_completed
- [ ] Watch for auth misconfiguration spikes

---

## T+24 hours

- [ ] Review analytics + support tickets
- [ ] Triage bugs into hotfix vs [post-launch-roadmap.md](../roadmap/post-launch-roadmap.md)
- [ ] Capture production screenshots for Notion

---

## Owners (fill in)

| Role | Name |
|------|------|
| Deploy | |
| QA sign-off | |
| Product sign-off | |
