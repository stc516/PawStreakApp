/**
 * Curated mascot scene library for PawStreak.
 *
 * This file is structure + organization only. It does not generate, render,
 * or import any image assets. It exists so designers and engineers can:
 *   - agree on which mascot moments belong on which surface
 *   - reserve filenames inside src/assets/mascot/<folder>/ ahead of art
 *   - keep copy and pose intent paired together
 *
 * Once art ships into a folder, set `assetFile` to the filename so importers
 * can resolve it (e.g. with `import.meta.glob` or a manual import map).
 * Until then, leave it null — code paths must tolerate missing assets.
 */

import type { MascotId } from './mascotGuidelines'

/**
 * Which mascot anchors a scene. `'duo'` means both characters appear
 * together; `'either'` means the surface should pick one based on tone /
 * personalization (e.g. user's chosen primary mascot).
 */
export type SceneMascot = MascotId | 'duo' | 'either'

export interface MascotScene {
  /** Stable id — used as React key, analytics tag, picker key, etc. */
  id: string
  /** Human-readable title used in design docs and the asset library. */
  title: string
  /** Which character anchors the scene. */
  mascot: SceneMascot
  /** One-sentence description of the pose and mood. */
  pose: string
  /** Suggested in-app copy that pairs with this scene. */
  copy: string
  /** Where this scene is meant to be used. Multiple surfaces are fine. */
  surfaces: readonly string[]
  /**
   * Optional rarity / spotlight tag — e.g. `'milestone'` or `'evergreen'`.
   * Useful when picking which scene to feature in rotations.
   */
  spotlight?: 'evergreen' | 'milestone' | 'seasonal'
  /**
   * Final asset filename inside the parent folder, once art exists.
   * `null` when only the scene plan exists.
   */
  assetFile: string | null
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  ONBOARDING                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export const onboardingScenes: readonly MascotScene[] = [
  {
    id: 'welcome-bailey-wave',
    title: 'Bailey waves hello (welcome)',
    mascot: 'bailey',
    pose: 'Bailey sits front-on, ears up, one paw raised in a friendly wave. Sunset behind.',
    copy: "Your dog's daily adventure starts here.",
    surfaces: ['Onboarding · Step 1 (welcome)'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'duo-hilltop-intro',
    title: 'Bailey and Meiomi on the hilltop (first adventure intro)',
    mascot: 'duo',
    pose: 'Both dogs side-by-side on a hilltop trail looking forward, tails up.',
    copy: "{Dog name}'s first adventure is waiting.",
    surfaces: ['Onboarding · Step 2 (first adventure intro)'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'meiomi-cozy-reminder',
    title: 'Meiomi cozy by a window (reminder cadence)',
    mascot: 'meiomi',
    pose: 'Meiomi curled up, head resting on paws, half-closed eyes. Soft morning light.',
    copy: "Pick a cadence — we'll nudge you gently when it's adventure time.",
    surfaces: ['Onboarding · Step 8 (reminders)'],
    assetFile: null,
  },
  {
    id: 'bailey-zip-explorer',
    title: 'Bailey with a tiny map (location step)',
    mascot: 'bailey',
    pose: 'Bailey standing alert with a rolled trail map under one paw.',
    copy: 'Your neighborhood is the first adventure.',
    surfaces: ['Onboarding · Step 7 (location / ZIP)'],
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  EMPTY STATES                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

export const emptyStateScenes: readonly MascotScene[] = [
  {
    id: 'bailey-leash-window',
    title: 'Bailey at the window with a leash',
    mascot: 'bailey',
    pose: 'Bailey sitting at a window, leash looped in his mouth, looking back over his shoulder.',
    copy: "Today's waiting.",
    surfaces: ['Dashboard · empty Last Adventure', 'Adventure · pre-start'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'meiomi-thought-pawprint',
    title: 'Meiomi with a paw-print thought bubble',
    mascot: 'meiomi',
    pose: 'Meiomi sitting calmly with a small thought bubble containing a single paw print.',
    copy: "{Dog name}'s story starts today.",
    surfaces: ['Story · empty timeline'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'bailey-unrolled-map',
    title: 'Bailey beside an unrolled map',
    mascot: 'bailey',
    pose: 'Bailey lying down next to an unrolled trail map, head tilted, curious.',
    copy: 'Pick a pack — every walk earns the first chapter.',
    surfaces: ['Packs · no adventures yet'],
    assetFile: null,
  },
  {
    id: 'duo-sit-together-quiet',
    title: 'Bailey and Meiomi sitting together (quiet)',
    mascot: 'duo',
    pose: 'Both dogs sitting side-by-side, looking out at nothing in particular.',
    copy: 'Nothing to log yet — the first one writes the first memory.',
    surfaces: ['Dashboard · all empty', 'Finds · 0 unlocked'],
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  LOADING                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export const loadingScenes: readonly MascotScene[] = [
  {
    id: 'meiomi-sniff-wind',
    title: 'Meiomi sniffing the wind',
    mascot: 'meiomi',
    pose: 'Meiomi standing still, nose lifted, ears soft. Subtle hair-blow.',
    copy: 'Picking a great one for {dog name}…',
    surfaces: ['Adventure · generating mission'],
    assetFile: null,
  },
  {
    id: 'bailey-patrol-profile',
    title: 'Bailey patrolling in profile',
    mascot: 'bailey',
    pose: 'Bailey walking in profile, tail high, looking forward — loop animation friendly.',
    copy: 'Scanning the route…',
    surfaces: ['Adventure · route preview', 'Packs · refreshing progress'],
    assetFile: null,
  },
  {
    id: 'duo-sit-look-up',
    title: 'Bailey and Meiomi sitting, looking up',
    mascot: 'duo',
    pose: 'Both dogs seated, heads tilted slightly upward, watching for something.',
    copy: 'Hydrating dashboard…',
    surfaces: ['Dashboard · cold start', 'PWA · install boot'],
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  ADVENTURE THEMES                                                          */
/* ────────────────────────────────────────────────────────────────────────── */

export const exhaustedHappyScenes: readonly MascotScene[] = [
  {
    id: 'bailey-post-adventure-roll',
    title: 'Bailey on his back, paws up (post-adventure)',
    mascot: 'bailey',
    pose: 'Bailey flopped on his back, tongue out, paws relaxed. Pure earned exhaustion.',
    copy: 'Earned it.',
    surfaces: ['Adventure complete modal · long walks', 'Share card · post-adventure'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'meiomi-cozy-chill',
    title: 'Meiomi cozy chill',
    mascot: 'meiomi',
    pose: 'Meiomi curled into a tight ball, eyes closing.',
    copy: 'Streak banked. Nap mode engaged.',
    surfaces: ['Reward page · streak save', 'Story · last adventure summary'],
    assetFile: null,
  },
  {
    id: 'bailey-need-coffee',
    title: 'Bailey "Need Coffee"',
    mascot: 'bailey',
    pose: 'Bailey looking sleepy with a small steaming coffee cup beside him.',
    copy: 'One more block. After coffee.',
    surfaces: ['Sticker pack', 'Coffee Crawl pack moments'],
    assetFile: null,
  },
] as const

export const coffeeCrawlScenes: readonly MascotScene[] = [
  {
    id: 'bailey-cafe-patio',
    title: 'Bailey on a café patio',
    mascot: 'bailey',
    pose: 'Bailey lying under a café chair, ears alert, tail thumping.',
    copy: 'Patio Pup-in-training.',
    surfaces: ['Coffee Crawl Pack · in-progress', 'Patio Pup Pack · in-progress'],
    assetFile: null,
  },
  {
    id: 'meiomi-coffee-companion',
    title: 'Meiomi by a coffee cup',
    mascot: 'meiomi',
    pose: 'Meiomi seated upright next to a takeaway coffee cup, calm gaze.',
    copy: 'A small ritual. A great morning.',
    surfaces: ['Coffee Crawl Pack · completed celebration'],
    assetFile: null,
  },
  {
    id: 'duo-coffee-walk',
    title: 'Duo on a coffee walk',
    mascot: 'duo',
    pose: 'Bailey leading, Meiomi calmly following, both with bandanas, urban backdrop.',
    copy: "Coffee crawl complete. We have a coffee shop now.",
    surfaces: ['Share card · Coffee Crawl Pack completion'],
    spotlight: 'milestone',
    assetFile: null,
  },
] as const

export const beachAdventureScenes: readonly MascotScene[] = [
  {
    id: 'bailey-tide-pools',
    title: 'Bailey at the tide pools',
    mascot: 'bailey',
    pose: 'Bailey crouched low at the edge of a tide pool, ears forward, blue eyes locked.',
    copy: 'Found something in the tide pools.',
    surfaces: ['Coastal Dog Pack · in-progress', 'Share card · beach adventure'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'meiomi-beach-stand',
    title: 'Meiomi standing on wet sand',
    mascot: 'meiomi',
    pose: 'Meiomi standing on wet sand, slight breeze in her coat, looking out to sea.',
    copy: 'Salt air. Big sky. Good day.',
    surfaces: ['Coastal Dog Pack · completed', 'Reward page · beach win'],
    assetFile: null,
  },
  {
    id: 'duo-beach-explorers',
    title: 'Bailey and Meiomi exploring the beach',
    mascot: 'duo',
    pose: 'Both dogs running parallel along the surf line, tails up, joyful.',
    copy: 'Officially Shore Dogs.',
    surfaces: ['Coastal Dog Pack · completion celebration'],
    spotlight: 'milestone',
    assetFile: null,
  },
] as const

export const sunsetAdventureScenes: readonly MascotScene[] = [
  {
    id: 'meiomi-sunset-watcher',
    title: 'Meiomi sunset watcher',
    mascot: 'meiomi',
    pose: 'Meiomi sitting still, watching the sun dip below the horizon. Warm rim light.',
    copy: 'Caught the good light.',
    surfaces: ['Sunset Chaser Pack · in-progress', 'Share card · sunset adventure'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'bailey-trail-golden-hour',
    title: 'Bailey on a golden-hour trail',
    mascot: 'bailey',
    pose: 'Bailey mid-step on a trail, long shadows, tail relaxed.',
    copy: 'Golden hour. Best hour.',
    surfaces: ['Sunset Chaser Pack · in-progress'],
    assetFile: null,
  },
  {
    id: 'duo-sunset-hilltop',
    title: 'Duo on the sunset hilltop',
    mascot: 'duo',
    pose: 'Both dogs silhouetted on a hilltop facing the sunset.',
    copy: 'Sunset Chaser unlocked. The sun knows your name.',
    surfaces: ['Sunset Chaser Pack · completion celebration'],
    spotlight: 'milestone',
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  STICKERS / EMOTES                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export const stickerScenes: readonly MascotScene[] = [
  {
    id: 'sticker-lets-go',
    title: "Bailey — Let's go!",
    mascot: 'bailey',
    pose: 'Bailey leaning forward, mouth open, exclamation energy.',
    copy: "Let's go!",
    surfaces: ['Sticker pack · adventure start', 'Share modal'],
    spotlight: 'evergreen',
    assetFile: null,
  },
  {
    id: 'sticker-good-day',
    title: 'Bailey — Good day!',
    mascot: 'bailey',
    pose: 'Bailey smiling broadly, eyes squinted with joy.',
    copy: 'Good day!',
    surfaces: ['Sticker pack · adventure complete'],
    assetFile: null,
  },
  {
    id: 'sticker-pawsome',
    title: 'Meiomi — Pawsome',
    mascot: 'meiomi',
    pose: 'Meiomi giving a soft, approving nod.',
    copy: 'Pawsome.',
    surfaces: ['Sticker pack · pack progress', 'Reward page'],
    assetFile: null,
  },
  {
    id: 'sticker-need-coffee',
    title: 'Bailey — Need coffee',
    mascot: 'bailey',
    pose: 'Bailey looking sleepy, small coffee cup beside him.',
    copy: 'Need coffee.',
    surfaces: ['Sticker pack · morning streak'],
    assetFile: null,
  },
  {
    id: 'sticker-so-tired',
    title: 'Bailey — So tired',
    mascot: 'bailey',
    pose: 'Bailey slumped happily, tongue out.',
    copy: 'So tired (in the good way).',
    surfaces: ['Sticker pack · long walk'],
    assetFile: null,
  },
  {
    id: 'sticker-booty-wiggle',
    title: 'Meiomi — Booty wiggle',
    mascot: 'meiomi',
    pose: 'Meiomi mid-wiggle, eyes bright.',
    copy: 'Booty wiggle activated.',
    surfaces: ['Sticker pack · pure joy moments'],
    assetFile: null,
  },
  {
    id: 'sticker-you-got-this',
    title: 'Meiomi — You got this',
    mascot: 'meiomi',
    pose: 'Meiomi looking up with quiet encouragement.',
    copy: 'You got this.',
    surfaces: ['Sticker pack · streak rescue', 'Reminders'],
    assetFile: null,
  },
  {
    id: 'sticker-adventure-buds',
    title: 'Bailey + Meiomi — Adventure buds',
    mascot: 'duo',
    pose: 'Both dogs leaning into each other, content.',
    copy: 'Adventure buds.',
    surfaces: ['Sticker pack · social moments', 'Share card branding'],
    spotlight: 'evergreen',
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  ACHIEVEMENT CELEBRATIONS                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export const achievementCelebrationScenes: readonly MascotScene[] = [
  {
    id: 'celebration-first-adventure',
    title: 'First adventure ever',
    mascot: 'bailey',
    pose: "Bailey mid-jump with a tiny burst of confetti behind him.",
    copy: 'First adventure logged. The story starts here.',
    surfaces: ['Reward page · first adventure', 'Finds · First Pawprint unlock'],
    spotlight: 'milestone',
    assetFile: null,
  },
  {
    id: 'celebration-week-streak',
    title: 'Seven-day streak',
    mascot: 'duo',
    pose: 'Bailey and Meiomi facing each other, mid-bow, playful.',
    copy: 'Seven days. Not perfection — presence.',
    surfaces: ['Reward page · 7-day streak', 'Finds · Unshakeable Duo'],
    spotlight: 'milestone',
    assetFile: null,
  },
  {
    id: 'celebration-pack-completed',
    title: 'Pack completed (generic)',
    mascot: 'either',
    pose: 'Featured mascot wearing a small ribbon with the pack identity name.',
    copy: '{Dog name} is officially a {pack identity}.',
    surfaces: ['Packs · pack completion celebration', 'Share card · pack completion'],
    spotlight: 'milestone',
    assetFile: null,
  },
  {
    id: 'celebration-renaissance-dog',
    title: 'Renaissance Dog (all four vibes)',
    mascot: 'duo',
    pose: 'Both dogs in profile, one looking left, one looking right — range.',
    copy: 'Range unlocked. Renaissance dog in the building.',
    surfaces: ['Finds · Renaissance Dog unlock'],
    spotlight: 'milestone',
    assetFile: null,
  },
  {
    id: 'celebration-quiet-win',
    title: 'Quiet win (after a near miss)',
    mascot: 'meiomi',
    pose: 'Meiomi resting her head on the user’s knee (implied), warm light.',
    copy: 'You made it. Today still counts.',
    surfaces: ['Reward page · saved streak', 'Empty state recovery'],
    assetFile: null,
  },
] as const

/* ────────────────────────────────────────────────────────────────────────── */
/*  AGGREGATE                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export const MASCOT_SCENES = {
  onboarding: onboardingScenes,
  emptyStates: emptyStateScenes,
  loading: loadingScenes,
  exhaustedHappy: exhaustedHappyScenes,
  coffeeCrawl: coffeeCrawlScenes,
  beachAdventure: beachAdventureScenes,
  sunsetAdventure: sunsetAdventureScenes,
  stickers: stickerScenes,
  achievementCelebrations: achievementCelebrationScenes,
} as const

export type MascotSceneCategory = keyof typeof MASCOT_SCENES
