# PawStreak Mascot Assets

This folder is the home of the PawStreak brand mascot system: **Bailey** (Chief
Adventure Officer) and **Meiomi** (Chief Heart Officer).

The single source of truth for art direction is:

```
master/pawstreak-mascot-master.png
```

That sheet contains the official character turnaround, expressions, adventure
poses, app icons, sticker pack, share-card poses, and color palette.

## Layout

```
master/         Approved master art and dated reference iterations
onboarding/     Welcome / first-run illustrations
empty-states/   Mascot scenes used when a screen has no data yet
loading/        Mascot poses for loading / waiting moments
stickers/       Reaction emotes for sharing and in-app delight
share/          Polished share-card artwork (social, recap)
icons/          App icon and simplified mascot marks
```

## Rules of thumb

- Do **not** drop generated assets directly into the app without approval.
  Treat the master sheet as the brand bible and validate any new pose / scene
  against the style notes in `src/content/mascotGuidelines.ts` first.
- Keep file names lowercased, kebab-cased, and descriptive (e.g.
  `bailey-coffee-crawl-sticker.png`, `meiomi-sunset-watcher.png`).
- When iterating, save dated reference renders inside `master/` like
  `pawstreak-mascot-2026-05-09-0125-19.png` so we can track evolution.
- Production-bound assets that ship in the bundle should be **optimized**
  (compressed PNG / lossless WebP) before being committed.

## Usage from code

Reference the master sheet like any Vite asset:

```ts
import mascotMaster from '@/assets/mascot/master/pawstreak-mascot-master.png'
```

The structured metadata for scenes and brand rules lives in:

- `src/content/mascotGuidelines.ts` — personality, voice, palette, art direction
- `src/content/mascotScenes.ts` — curated lists of scene ideas per surface
