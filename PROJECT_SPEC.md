# PawStreak — Product + Technical Build Spec

## Core Product Thesis

PawStreak is NOT a dog-walking tracker.

It is:

“A daily ritual where the dog is the main character and the owner helps the dog win the day.”

Core emotional question:

“Did Bailey win today?”

The app should feel:
- warm
- motivating
- emotional
- lightweight
- habit-forming

NOT:
- corporate
- clinical
- data-heavy
- productivity-focused

---

# Product Goals

The app should:
- increase daily dog adventures
- create emotional attachment
- build streak habits
- encourage sharing
- feel rewarding and memorable

The app should NOT:
- become Strava for dogs
- become a complex social network
- become overloaded with features
- feel like work

---

# Core User Loop

1. User opens app
2. Dog status appears
3. User sees whether dog won today
4. User chooses an adventure or uses “Pick for Me”
5. User completes adventure
6. Reward screen celebrates the dog
7. Streak is protected
8. User shares result
9. User commits to tomorrow

---

# Tech Stack

Use:
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Supabase
- localStorage fallback/demo mode

Keep architecture clean and scalable.

---

# Design Direction

Mobile-first.

The app should feel:
- premium
- modern
- emotionally warm
- simple
- clean

Visual inspiration:
- Duolingo emotional retention
- Strava accomplishment
- Tamagotchi emotional attachment
- Apple-level spacing/simplicity

Color direction:
- warm whites
- soft backgrounds
- energetic accent colors
- playful but premium

Avoid:
- dense dashboards
- too many charts
- enterprise UI
- clutter

---

# Homepage / Dashboard Rules

Homepage hierarchy MUST be:

1. Dog-first status card
2. Streak / streak-at-risk state
3. Start Adventure action
4. Pick for Me
5. Lightweight stats
6. Recent adventures lower down

The homepage should answer:
- Did the dog win today?
- Is the streak safe?
- What should I do next?

Stats are secondary.

---

# Dog-First Copy Rules

Bad:
- Start walk
- Activity complete
- You earned XP
- Log activity

Good:
- Start Bailey’s adventure
- Bailey won the day
- Bailey protected the streak
- Bailey earned today’s chapter

Use dynamic dog name wherever possible.

---

# Required Features

## Dashboard
States:
- waiting for adventure
- streak at risk
- dog won the day

Examples:
- “Bailey is waiting for today’s adventure.”
- “Bailey’s streak ends today.”
- “Bailey won the day.”

---

## Adventure Types

Keep:
- Quick Adventure
- Park Adventure
- Beach Adventure
- Explore New Spot

---

## Pick for Me

Must exist.

Purpose:
Help users decide what kind of day their dog should have.

Example suggestions:
- “Bailey needs a sniff-heavy adventure today.”
- “Take the long way home.”
- “Find one new place Bailey has never sniffed.”
- “Quick adventure before dinner keeps the streak safe.”

Do NOT add maps/trails APIs yet.

---

## Reward Screen

Must include:
- “Bailey won the day”
- XP earned
- streak protected
- +1 toward milestone
- share button
- “Same time tomorrow?”
- reminder toggle

Must feel emotionally rewarding.

---

## Story / Stats Tab

Must exist.

Purpose:
Give stat-loving users deeper engagement.

Include:
- total adventures
- total distance
- current streak
- longest streak
- recent adventures
- badges
- milestones
- favorite adventure type

Keep it lightweight.
No heavy charts/libraries.

Should feel like:
“A memory timeline with useful stats.”

---

## Share System

Must exist.

Share copy should feel emotional and human.

Example:
“Bailey just protected her 5-day adventure streak 🐾🔥
Trying not to let her down tomorrow.”

---

## Reminder System

Simple local-state reminder toggle only for now.

No push notifications/backend required yet.

---

# Authentication

Support:
- Supabase email/password auth
- guest/demo mode

Requirements:
- user can immediately use app without signup
- first adventure should be frictionless
- if no dog name:
  default to “Your dog”

Demo mode should persist:
- dog
- adventures
- streak
- badges
- reminders

using localStorage.

---

# Database Requirements

Use Supabase.

Tables needed:
- profiles
- pets
- adventures
- streaks
- badges
- user_badges
- reminders

Use Row Level Security.

Users can only access their own data.

---

# Folder Structure

src/
  components/
  pages/
  hooks/
  lib/
  utils/
  data/
  types/

---

# Required Routes

- /
- /auth
- /app
- /adventure
- /reward
- /story
- /badges
- /profile

---

# Analytics Events

Create lightweight analytics utility.

Track:
- adventure_started
- adventure_completed
- streak_protected
- badge_unlocked
- share_clicked
- reminder_clicked
- pick_for_me_clicked

Use console logs for now.

Do NOT integrate PostHog yet.

---

# Important Constraints

DO NOT:
- add subscriptions
- add monetization
- add maps
- add training systems
- add AI chat
- add complex social feeds
- overengineer

DO:
- prioritize emotional retention
- prioritize speed
- keep code clean
- build MVP fast
- preserve warmth/simplicity

---

# Final Goal

Build a production-ready MVP that:
- feels emotionally engaging
- creates daily return behavior
- encourages sharing
- can later become a mobile app

The app should make users feel:

“My dog had a better day because of me.”