# onboarding/

Welcome illustrations and emotional onboarding scenes.

These appear on the very first screens a new user sees, so they must hit the
brand emotional goal — *"My dog had a great day."* — within a single glance.

## Suggested scenes

See `src/content/mascotScenes.ts → onboardingScenes` for the curated list.
Highlights include:

- Bailey waving hello on a sunset trail (welcome step)
- Bailey + Meiomi side-by-side on a hilltop (first-adventure intro)
- Meiomi cozy with closed eyes (reminder cadence step)

## Naming

```
bailey-welcome-wave.png
meiomi-cozy-reminder.png
duo-sunset-hilltop.png
```

## Sizing

Onboarding illustrations should render crisp at the welcome step's hero size
(roughly 240–320px tall on a 390px-wide phone). Export at 2× and 3× density
for retina screens; let `<picture>`/Vite handle responsive selection.
