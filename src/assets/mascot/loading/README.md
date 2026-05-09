# loading/

Mascot poses for loading and waiting moments — generating an adventure,
hydrating from the network, or stitching together a recap.

## Style

- Loop-friendly: poses should feel natural to animate (slow head bob, tail
  wag, breathing) without ever feeling jittery.
- Calm: this is a "wait a beat with us" moment, not a "hurry up" moment.
  Lean into Meiomi for these — her grounding energy is the whole point.

## Suggested scenes

See `src/content/mascotScenes.ts → loadingScenes`. Highlights:

- Meiomi sniffing the wind (generating today's adventure)
- Bailey patrolling in profile (route preview)
- Bailey + Meiomi sitting together looking up (hydrating dashboard)

## Format

Prefer Lottie / WebM / animated WebP for loops. For static fallbacks, ship a
PNG sized for the largest container the loader appears in.
