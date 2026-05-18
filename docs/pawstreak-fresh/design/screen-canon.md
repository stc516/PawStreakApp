# Screen Canon

> Route ↔ component ↔ Stitch ↔ testids

---

## Launch screens

### Today (`/app`)

| | |
|-|-|
| **Component** | `src/pages/DashboardPage.tsx` |
| **Stitch** | `today_app`, `today_app_fix` |
| **Key testids** | `dashboard-hero-status`, `dashboard-gm-title`, `dashboard-start-adventure-cta`, `dashboard-adventure-chips`, `dashboard-recent-memories`, `dashboard-stats-row`, `dashboard-the-wild-cta` |

### Plan + Active (`/adventure`)

| | |
|-|-|
| **Component** | `src/pages/AdventurePage.tsx` |
| **Stitch** | `plan_discovery_adventure`, `active_adventure_adventure_live` |
| **State** | `planMode` boolean (local React state) |
| **Key testids** | `adventure-send-off`, `adventure-memory-input`, `adventure-complete-modal` |

### Journey (`/story`)

| | |
|-|-|
| **Component** | `src/pages/StoryPage.tsx` |
| **Stitch** | `journey_story` |
| **Overlay** | `MemoryDetailSheet` (bottom sheet) |
| **Key testids** | `story-page` |

### Path (`/wild`)

| | |
|-|-|
| **Component** | `src/pages/TheWildPage.tsx` |
| **Stitch** | `path_wild` |
| **Key testids** | `wild-page`, `wild-current-card`, `wild-tier-1`…`wild-tier-6` |

### Profile (`/account`)

| | |
|-|-|
| **Component** | `src/pages/AccountPage.tsx` |
| **Stitch** | `profile_account` |
| **Key testids** | `account-page`, `account-back`, `account-email-input` |

### Reward (`/reward`)

| | |
|-|-|
| **Component** | `src/pages/RewardPage.tsx` |
| **Stitch** | `reward_celebration` |
| **Key testids** | `reward-headline`, `reward-memory-card` |

### Onboarding (`/`)

| | |
|-|-|
| **Component** | `src/pages/OnboardingPage.tsx` |
| **Stitch** | `onboarding_story_hook`, `onboarding_profile_setup`, `onboarding_local_discovery`, `onboarding_final_step` |
| **Key testids** | `onboarding-welcome`, `dog-name-input`, `onboarding-primary-button` |

---

## Flow-only screens

| Route | Component | Notes |
|-------|-----------|-------|
| `/character-moment` | `CharacterMomentPage.tsx` | Between complete and reward — polish backlog |

---

## Hidden routes (exist, not in nav)

| Route | Component |
|-------|-----------|
| `/packs` | `PacksPage.tsx` |
| `/badges` | `BadgesPage.tsx` |

---

## Related

- [navigation-system.md](./navigation-system.md)
- [stitch-canon.md](./stitch-canon.md)
