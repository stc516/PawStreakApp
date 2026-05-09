/**
 * PawStreak mascot brand guidelines (typed source of truth).
 *
 * The visual source of truth lives at:
 *   src/assets/mascot/master/pawstreak-mascot-master.png
 *
 * This file is a typed mirror of the rules captured in that brand sheet so
 * code, designers, and future contributors can reference one canonical
 * description of who Bailey and Meiomi are, how they should look, and how
 * they should sound.
 *
 * Nothing here ships into runtime UI by accident — these are constants used
 * only by tooling, mascot pickers, and design docs. Importing this file does
 * not change product behavior.
 */

export type MascotId = 'bailey' | 'meiomi'

export interface MascotPersonality {
  id: MascotId
  name: string
  title: string
  /** One-line emotional positioning. */
  tagline: string
  /** Short personality adjectives — keep evocative, not corporate. */
  traits: readonly string[]
  /** What this character is known for in the brand world. */
  knownFor: string
  /** Visual fingerprint — coat, eyes, distinctive features. */
  appearance: string
  /** Approved in-app expressions for this character (from the master sheet). */
  expressions: readonly string[]
  /** Voice samples — the way this character would *sound* in copy. */
  voice: readonly string[]
}

export const MASCOTS: Readonly<Record<MascotId, MascotPersonality>> = {
  bailey: {
    id: 'bailey',
    name: 'Bailey',
    title: 'Chief Adventure Officer',
    tagline: 'Always up for the next adventure.',
    traits: ['adventurous', 'emotionally expressive', 'chaotic-good', 'curious', 'energetic'],
    knownFor: 'Pulling the leash toward the door before you have your shoes on.',
    appearance:
      'Black-and-white husky with bright blue eyes, orange PawStreak bandana, expressive ears and tail.',
    expressions: ['happy', 'excited', 'focus', 'chaos mode'],
    voice: [
      "Let's go.",
      'Found something — we have to investigate.',
      'You got this. I got this. We got this.',
    ],
  },
  meiomi: {
    id: 'meiomi',
    name: 'Meiomi',
    title: 'Chief Heart Officer',
    tagline: 'Calm, loyal, grounding — always by your side.',
    traits: ['calm', 'grounding', 'emotionally warm', 'wise', 'supportive'],
    knownFor: 'Resting her chin on your knee at exactly the right moment.',
    appearance:
      'Tan / light-brown coat with soft features, purple PawStreak bandana, gentle eyes.',
    expressions: ['calm', 'loving', 'thinking', 'side eye'],
    voice: [
      'Take a breath. The adventure is right here.',
      'Today still counts.',
      'Proud of you.',
    ],
  },
} as const

export const BRAND_TONE = {
  /** The single emotional outcome we are designing for, end of every flow. */
  emotionalGoal: 'My dog had a great day.',
  /** Short voice principles — what the brand sounds like in plain copy. */
  voicePrinciples: [
    'Speak to the dog and the human at the same time.',
    'Warm, modern, premium — never corporate, never cutesy-baby.',
    'Lead with feeling, then with feature.',
    'Celebrate effort, not perfection.',
    'Short sentences. Generous whitespace. Earned exclamation points.',
  ],
  /** Hard-no list for live UI copy. */
  doNotUseInUI: [
    'profanity',
    'shaming language ("you missed", "you failed")',
    'corporate filler ("solutions", "leverage", "stakeholders")',
    'baby talk',
    'emojis used as bullet points (use them sparingly, with intent)',
  ],
  /** Approved hero taglines pulled from the brand sheet. */
  taglines: [
    'Adventure together. Every day.',
    'Adventure. Bond. Remember.',
    "Every adventure writes your dog's story.",
  ],
} as const

export const VISUAL_DIRECTION = {
  description:
    'Premium cartoon mascots with clean shapes, soft shading, expressive eyes, and an outdoor adventure vibe. Reads beautifully on a dark UI.',
  references: [
    'Duolingo — emotional clarity, instant character recognition',
    'Patagonia — restraint, outdoors color story, premium tone',
    'Premium mobile-game polish — confident shapes, clean light',
  ],
  do: [
    'Clean, friendly shapes',
    'Bold outlines on stickers and small marks',
    'Soft shading for depth',
    'Expressive eyes — eyes do most of the emotional work',
    'Adventure & outdoors atmosphere (sunsets, trails, beach, neighborhood)',
    'Warm, premium, playful',
  ],
  doNot: [
    'Childish / Saturday-morning-cartoon energy',
    'Hyper-realistic / photographic renders',
    'Stocky generic dog illustrations',
    'Sterile flat-shape icons with no soul',
    'Anything that overpowers the user’s actual dog',
  ],
} as const

/**
 * Color palette pulled from the master sheet swatches.
 * NOTE: these are *brand reference* swatches for mascot art direction.
 * They intentionally live alongside (and may differ slightly from) the
 * runtime UI tokens declared in `src/index.css`. Do not swap UI tokens for
 * these without an explicit design decision.
 */
export const MASCOT_PALETTE = [
  { id: 'midnight', hex: '#0E1B2D', label: 'Midnight (deep brand background)' },
  { id: 'dusk', hex: '#1E3A3F', label: 'Dusk (atmospheric mid-tone)' },
  { id: 'fern', hex: '#43B656', label: 'Fern (trail accent / wins)' },
  { id: 'paw-orange', hex: '#FF6A30', label: 'Paw Orange (signature warmth)' },
  { id: 'sand', hex: '#F2D4D3', label: 'Sand (soft highlight)' },
  { id: 'driftwood', hex: '#8B7280', label: 'Driftwood (neutral shadow)' },
] as const

/** Which UI surfaces benefit from which character. */
export const USAGE_GUIDANCE = {
  bailey: [
    'Welcome / first-run hero illustrations',
    'Adventure start CTAs ("Let’s go" energy)',
    'Streak-save and pack-progress moments',
    'Hype stickers on share cards',
  ],
  meiomi: [
    'Loading and waiting moments',
    'Empty states and quiet first-run screens',
    'Reminder cadence + notification preferences',
    'Calm encouragement after a missed day',
  ],
  duo: [
    'Brand-defining moments — onboarding finale, first completed pack',
    'Share-card "Adventure Buds" pose',
    'Achievement celebrations that benefit from both energies',
  ],
} as const

export const ANIMATION_DIRECTION = {
  description:
    'Motion should feel alive but never frantic. Think breathing, not blinking neon. Loop-friendly, easy on battery, and respect prefers-reduced-motion.',
  approved: [
    'Slow tail wag (≈400ms cycle, ease-in-out, alternates)',
    'Subtle head bob on hover / tap',
    'Single bounce-in on celebration cards',
    'Gentle ear twitch on idle (random, low frequency)',
    'Static fallback whenever prefers-reduced-motion is set',
  ],
  avoid: [
    'Continuous spinning / cartwheels',
    'Flashing colors or strobing effects',
    'Long animations that block interaction',
    'Per-frame redraws that ignore reduced-motion preferences',
  ],
} as const

export const MASCOT_GUIDELINES = {
  mascots: MASCOTS,
  tone: BRAND_TONE,
  visual: VISUAL_DIRECTION,
  palette: MASCOT_PALETTE,
  usage: USAGE_GUIDANCE,
  animation: ANIMATION_DIRECTION,
  /** Path the rest of the codebase should reference for the canonical art. */
  masterAssetPath: 'src/assets/mascot/master/pawstreak-mascot-master.png',
} as const

export type MascotGuidelines = typeof MASCOT_GUIDELINES
