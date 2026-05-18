---
name: Cinematic Amber
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#dbc2ad'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#a38d7a'
  outline-variant: '#554334'
  surface-tint: '#ffb874'
  primary: '#ffbd7f'
  on-primary: '#4b2800'
  primary-container: '#ff9500'
  on-primary-container: '#643700'
  inverse-primary: '#8c5000'
  secondary: '#ffb599'
  on-secondary: '#5a1c00'
  secondary-container: '#ff5e00'
  on-secondary-container: '#531900'
  tertiary: '#ffbe68'
  on-tertiary: '#462a00'
  tertiary-container: '#e9a035'
  on-tertiary-container: '#5e3b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcbf'
  primary-fixed-dim: '#ffb874'
  on-primary-fixed: '#2d1600'
  on-primary-fixed-variant: '#6a3b00'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#ffddb6'
  tertiary-fixed-dim: '#ffb95a'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  display-time:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1'
    letterSpacing: -0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter-grid: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  card-padding: 20px
---

## Brand & Style

This design system is built on an emotional, lifestyle-first foundation designed to evoke warmth, companionship, and premium quality. It targets discerning pet owners who view their animals as family members, requiring a UI that feels less like a utility and more like a digital keepsake.

The visual style is a blend of **Modern Startup** and **Cinematic Dark Mode**. It utilizes deep, ink-black backgrounds to allow photography and vibrant amber accents to "pop" with a glow effect reminiscent of a sunset. The aesthetic leans into high-polish surfaces, utilizing soft gradients and subtle depth to create a sense of intimacy and luxury.

## Colors

The palette is centered around a "Golden Hour" theme. The primary and secondary colors form a warm gradient that represents energy and affection. 

- **Primary & Secondary:** Used for high-action items, progress indicators (streaks), and active states. 
- **Neutral:** A range of deep charcoals and blacks (e.g., `#0A0A0A`, `#161616`, `#1C1C1E`) provides the canvas.
- **Accents:** Use low-opacity amber glows behind key icons or cards to simulate a light-source effect, enhancing the cinematic feel.

## Typography

The design system utilizes **Inter** for its modern, neutral, and highly legible characteristics, mimicking a native iOS experience. 

- **Hierarchy:** Strong contrast between bold headlines and lighter body weights is essential for readability against dark backgrounds.
- **Display Weights:** Use thinner weights (Light/300) for large numerical displays (like timers or streak counts) to maintain a sophisticated feel without being overly heavy.
- **Tracking:** Apply slight tracking increases to small caps or labels to ensure legibility on high-density displays.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on generous safe areas. 

- **Margins:** 24px side margins are standard across mobile to provide breathing room and a premium, less-cluttered feel.
- **Rhythm:** An 8px linear scale guides all spatial relationships.
- **Adaptive Strategy:** On tablets and larger screens, content cards should be constrained to a max-width container (approx. 720px for feed content) to maintain the intimate "phone-first" portrait feel.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Ambient Glows** rather than traditional drop shadows.

- **Surface Tiers:** Background is the darkest tier (#0A0A0A). Primary cards sit on the next tier (#1C1C1E). Floating elements or active inputs sit on the third tier (#2C2C2E).
- **Glow Effects:** High-priority elements (like the active "Start" button or a Pet Profile) should feature a subtle, soft-diffusion radial gradient behind them using the primary amber color at 10-15% opacity.
- **Inner Borders:** Use a 1px solid border with low opacity (white at 10%) on cards to define edges against the dark background.

## Shapes

The shape language is overtly soft and organic, mirroring the friendly nature of the pet-focused content. 

- **Cards:** Use a minimum of 24px (`rounded-xl` / level 3) for main content containers.
- **Interactive Elements:** Buttons and input fields should utilize full pill-shaping (circular ends) to maintain a friendly, approachable aesthetic.
- **Avatars:** Always circular with a 2px offset border or a subtle amber glow to indicate status or "streak" activity.

## Components

- **Buttons:** Primary buttons use a linear gradient from `#FF9500` to `#FF5E00`. They should include a subtle "bloom" or outer glow on hover/active states.
- **Cards:** Content cards feature a dark charcoal background with high corner radii. Images within cards should have a subtle darkening overlay at the bottom to ensure white text overlay is legible.
- **Chips/Filters:** These should be pill-shaped. Inactive chips use a dark stroke; active chips use a solid amber fill with dark text.
- **Progress Indicators (The "Streak"):** Visualized with a custom flame icon and a gradient-filled ring. The "Path" component uses a dotted or solid amber line to connect chronological events.
- **Input Fields:** Minimalist with a soft dark fill and 1px border that glows amber when focused.
- **Memories/Lists:** Use a horizontal scrolling carousel for "Recent Memories" with edge-fading to imply more content.