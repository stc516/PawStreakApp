import { useState, useEffect } from "react";

// ── TOKENS ──────────────────────────────────────────────
const T = {
  amber:   "#F5A623",
  amberDim:"#C47D10",
  cream:   "#FDF6EC",
  dark:    "#111009",
  bark:    "#2A1C0F",
  barkMid: "#3D2B1A",
  moss:    "#3A5A3A",
  mossDim: "#2A3E2A",
  coral:   "#D9604A",
  ice:     "#A8CCE0",
  iceDim:  "#5A8FAA",
  muted:   "#665544",
  faint:   "#33291E",
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
`;

// ── DATA ─────────────────────────────────────────────────

const NOTION_PAGES = [
  { label: "📋 Main Dashboard",     url: "https://notion.so", desc: "Your home base — replace with real URL after setup" },
  { label: "📅 Posting Calendar",   url: "https://notion.so", desc: "Weekly content schedule" },
  { label: "🗂️ Content Vault",      url: "https://notion.so", desc: "All media assets + ideas database" },
  { label: "✅ Daily Checklist",    url: "https://notion.so", desc: "Today's tasks" },
  { label: "📝 Prompt Library",     url: "https://notion.so", desc: "Saved AI prompts" },
  { label: "📊 Analytics Log",      url: "https://notion.so", desc: "Weekly performance notes" },
];

const PHASES = [
  {
    id: "notion",
    emoji: "🗒️",
    label: "Notion Setup",
    subtitle: "Your daily home base",
    accent: T.ice,
    blocks: [
      {
        title: "Step 1 — Create Your Notion Workspace",
        items: [
          { text: "Sign up for Notion (free plan works to start)", link: "https://notion.so", linkLabel: "notion.so — sign up free" },
          { text: "Create a new page called '🐾 Bailey & PawStreak OS'", note: "This becomes your daily home. Bookmark it in your browser and phone." },
          { text: "Install Notion on your phone", link: "https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281", linkLabel: "Notion iOS app" },
          { text: "In Notion settings → Appearance → set as your default page on open", note: "This means every time you open Notion you land here" },
          { text: "Bookmark the page in Safari/Chrome for one-tap access on desktop", },
          { text: "Add Notion to your phone home screen (Safari → Share → Add to Home Screen)", note: "Makes it feel like a native app" },
        ]
      },
      {
        title: "Step 2 — Build the 6 Core Pages",
        note: "Create each as a sub-page inside your OS. After creating, paste the real URLs into the links below.",
        items: [
          { text: "Create page: '📅 Posting Calendar' — use the Notion Calendar view + Table view", link: "https://www.notion.so/help/guides/using-databases-in-notion", linkLabel: "Notion database guide" },
          { text: "Create page: '🗂️ Content Vault' — database with properties: Platform, Tone, Status, Format, Date, Tags", },
          { text: "Create page: '✅ Daily Checklist' — simple toggle list, reset each morning", },
          { text: "Create page: '📝 Prompt Library' — table with columns: Tool, Purpose, Prompt, Last Used", },
          { text: "Create page: '📊 Analytics Log' — weekly table: Week, Platform, Top Post, Followers, Notes", },
          { text: "Link all 5 pages back to your main dashboard using /link in Notion", note: "Type /link on the dashboard page to embed clickable cards for each sub-page" },
        ]
      },
      {
        title: "Step 3 — Daily Habit (30 seconds)",
        items: [
          { text: "Each morning: open Notion OS → check Daily Checklist → check Posting Calendar", note: "This is your entire morning ritual. Under 2 min." },
          { text: "Each Sunday: open Content Vault → queue next week's posts in scheduler", },
          { text: "Set a recurring iPhone reminder: 'Open Notion OS' at 8am daily", },
        ]
      }
    ]
  },
  {
    id: "phase1",
    emoji: "📁",
    label: "Phase 1: Media Org",
    subtitle: "Organize 5,000+ files",
    accent: T.amber,
    blocks: [
      {
        title: "Google Drive Folder Structure",
        items: [
          { text: "Create root folder: '🐾 Bailey & Meiomi — Master Content'", link: "https://drive.google.com", linkLabel: "Google Drive" },
          { text: "Create sub-folder: '🏔️ Mountains + Snow + Wild'", },
          { text: "Create sub-folder: '🌊 Beach + Bay + Water'", },
          { text: "Create sub-folder: '🥾 Trails + Hikes'", },
          { text: "Create sub-folder: '☕ Bars + Cafes + Patios'", },
          { text: "Create sub-folder: '⛳ Golf + Lifestyle'", },
          { text: "Create sub-folder: '🤍 Bailey + Meiomi Together'", },
          { text: "Create sub-folder: '🏌️ Dad + Dogs'", },
          { text: "Create sub-folder: '🎬 PawStreak-Ready' (A-tier vertical video only)", },
          { text: "Create sub-folder: '✅ Posted' (move content here after publishing)", note: "Never repost — this folder prevents that" },
          { text: "Create sub-folder: '⭐ Top Tier' (your 50 absolute best assets)", note: "Pull from here first when you need a high-impact post" },
        ]
      },
      {
        title: "Content Ranking System",
        items: [
          { text: "A-Tier: vertical video, good light, dogs are the subject, emotion or action visible → goes in category folder + Top Tier", note: "These are Reels, TikToks, hero posts" },
          { text: "B-Tier: great photo or decent video → carousels, Stories, filler days", },
          { text: "C-Tier: blurry, chaotic, imperfect but funny → raw TikTok energy, often viral", note: "Don't delete these. The messy ones perform." },
          { text: "Voice-note a caption idea immediately when you sort a file", note: "Use iPhone Voice Memos — caption inspiration fades in minutes" },
        ]
      },
      {
        title: "Weekly Sort Ritual (Sunday, 20 min)",
        items: [
          { text: "AirDrop or Google Photos auto-backup new content from the week", link: "https://photos.google.com", linkLabel: "Google Photos" },
          { text: "Drag each new file into its category folder", },
          { text: "Star your top 3 new pieces", },
          { text: "Open scheduler (Later or Buffer) and queue next week from starred content", },
          { text: "Move anything you posted this week into the '✅ Posted' folder", },
        ]
      }
    ]
  },
  {
    id: "phase2",
    emoji: "📅",
    label: "Phase 2: Content System",
    subtitle: "Weekly themes + posting cadence",
    accent: T.coral,
    blocks: [
      {
        title: "Weekly Theme Calendar — @baileyhuskycream",
        items: [
          { text: "MONDAY — 'Mountain Mondays' 🏔️: Best outdoor/trail/snow Reel or TikTok. Caption: 'The only Monday cure.'", note: "Your highest-quality adventure footage goes here" },
          { text: "TUESDAY — 'Together Tuesday' 🤍: Bailey + Meiomi side-by-side. Opposite energy. Best friend chaos.", note: "This is your most shareable recurring series" },
          { text: "WEDNESDAY — 'Dad Wednesday' 🏌️: You + dogs doing human things. Golf, coffee, errands. Chaos energy.", note: "The funny dad pillar. Authenticity is the whole point." },
          { text: "THURSDAY — 'Story Thursday' 📸: One older photo + emotional caption. Builds deep follower connection.", note: "Write these in batch on Sunday. Takes 10 min for the whole week." },
          { text: "FRIDAY — 'Shore Friday' 🌊: Beach, bay, water vibes. Loose, free, beautiful.", note: "End-of-week content should feel effortless" },
          { text: "SATURDAY — 'Social Saturday' ☕: Bars, cafes, patios. Always tag the location.", note: "Location tags drive local discovery — never skip this" },
          { text: "SUNDAY — 'Still Sunday' 🌅: One beautiful quiet photo. Minimal caption.", note: "The contrast to the rest of the week. Followers love the pace shift." },
        ]
      },
      {
        title: "Recurring Content Series (Build These Over Time)",
        items: [
          { text: "Series: 'What Bailey Sees' — POV shots from her level. Weekly. Extremely shareable.", },
          { text: "Series: 'Meiomi vs Bailey' — same situation, completely different reactions. Carousel or split-screen.", },
          { text: "Series: 'Dad Report' — you narrate what happened this week like a nature documentary", note: "Deadpan narration over chaotic dog footage = high engagement" },
          { text: "Series: 'Places Bailey Has Approved' — location reviews from her perspective", note: "Great for brand deals with dog-friendly venues" },
          { text: "Series: 'The Streak' — weekly PawStreak cross-promo, Bailey's ongoing streak number shown", },
        ]
      },
      {
        title: "Caption + Hook Frameworks",
        items: [
          { text: "Hook formula 1: 'She did [thing] and I can't stop thinking about it'", note: "Works for emotional and funny content equally" },
          { text: "Hook formula 2: 'The face she makes when [specific thing]' — then deliver the photo", },
          { text: "Hook formula 3: '[Number] things Bailey has taught me about [topic]' — carousel", },
          { text: "CTA formula: Always end with a question ('Does your dog do this?') or a soft share ('Send this to someone whose dog runs the house')", note: "Questions get comments. Share CTAs get reach." },
          { text: "Emotional closer: 'They don't know how long forever is. We do.' — use sparingly, maximum impact", note: "This type of line is what gets screenshotted and reposted" },
        ]
      }
    ]
  },
  {
    id: "phase3",
    emoji: "🔄",
    label: "Phase 3: Posting Workflow",
    subtitle: "Tools, scheduling, automation",
    accent: T.moss,
    blocks: [
      {
        title: "Scheduling Setup",
        items: [
          { text: "Sign up for Later (recommended — best visual planner for IG + TikTok)", link: "https://later.com", linkLabel: "Later.com — free plan" },
          { text: "Connect Instagram @baileyhuskycream to Later", },
          { text: "Connect TikTok @baileyhuskycream to Later", },
          { text: "Set optimal posting times: IG — 7–9am or 6–8pm. TikTok — 6–9pm.", note: "Later's analytics will refine this to your specific audience over time" },
          { text: "Every Sunday: batch-upload 7 posts to Later. Schedule the week in one session.", note: "This is the entire automation strategy. Sunday batching = zero daily stress." },
        ]
      },
      {
        title: "Editing Workflow (CapCut)",
        items: [
          { text: "Download CapCut mobile + desktop", link: "https://www.capcut.com", linkLabel: "CapCut.com" },
          { text: "Create a saved 'Bailey Template' in CapCut: amber/cream color accents, your chosen font, music style saved", note: "Every video should feel like it's from the same creator" },
          { text: "Always enable Auto Captions on every video", note: "Captions increase watch time by ~40% — non-negotiable" },
          { text: "Use CapCut's 'Beat Sync' to cut clips to music automatically", note: "Saves 30+ min per video" },
          { text: "For TikTok: trim to under 30 sec for best reach. For Reels: 7–15 sec or 30–60 sec perform best.", },
        ]
      },
      {
        title: "Cross-Posting Workflow (No Extra Work)",
        items: [
          { text: "Post TikTok first. Download without watermark via ssstik.io", link: "https://ssstik.io", linkLabel: "Remove TikTok watermark" },
          { text: "Upload clean version to Instagram Reels", },
          { text: "Upload same clean version to YouTube Shorts", link: "https://studio.youtube.com", linkLabel: "YouTube Studio" },
          { text: "One video → three platforms → zero extra editing", note: "This is how you stay consistent without burning out" },
        ]
      }
    ]
  },
  {
    id: "phase4",
    emoji: "🐾",
    label: "Phase 4: PawStreak Launch",
    subtitle: "Coming soon + signature shorts",
    accent: T.amber,
    blocks: [
      {
        title: "7-Day Coming Soon Campaign (Start Today)",
        items: [
          { text: "Day 1 TODAY: 'Something is coming for dog people 🐾' — dark screen, paw print, no context. Mystery.", note: "Mystery posts get saved and reshared when the reveal drops" },
          { text: "Day 2: Amber glow animation + 'Every walk. Every streak. Every adventure.' — Canva or CapCut", link: "https://www.canva.com", linkLabel: "Build in Canva" },
          { text: "Day 3: Bailey on a walk, overlay text: 'Day 47 of her streak 🔥' — real footage, app coming soon", note: "Shows the concept in action before the app exists" },
          { text: "Day 4: Slow montage of your best clips: 'The adventures they go on. The places they love. The streaks you keep.'", },
          { text: "Day 5: Feature tease — 'Adventure Cards drop soon 🗺️' — show a mockup card in Canva", },
          { text: "Day 6: Emotional post — 'You are your dog's whole world. The time you get is finite. We're building something for that.' — Bailey looking at camera", note: "This is the mission statement post. It will hit hard." },
          { text: "Day 7: 'PawStreak. Free in bio when it drops.' — waitlist signup link", link: "https://mailchimp.com", linkLabel: "Set up waitlist (Mailchimp free)" },
        ]
      },
      {
        title: "The PawStreak Signature Short — Production System",
        items: [
          { text: "Design 'Adventure Card' in Canva: amber bg, dog name in bold serif, mission title (e.g. 'Shore Patrol'), XP badge bottom right", link: "https://www.canva.com", linkLabel: "Canva" },
          { text: "Create 5 card variations to start: Shore Patrol, Urban Scout, Trail Blazer, Snow Day, Social Pup", },
          { text: "Find card-flip whoosh sound effect for the 0–2 sec opening", link: "https://freesound.org", linkLabel: "Freesound.org — free SFX" },
          { text: "Build CapCut master template: 2s card animation → 8s real footage → 5s freeze reward screen", note: "Save as template — each new Signature Short takes under 10 min" },
          { text: "Design Reward Screen: XP counter animation, streak number, amber glow — CapCut number ticker effect", },
          { text: "Record CTA voiceover once: 'Does your dog have a streak?' — deadpan, same every single time", note: "Same voice + same line = the signature becomes recognizable within weeks" },
          { text: "Post to @PawStreak TikTok + IG Reels + YouTube Shorts every time", },
        ]
      }
    ]
  },
  {
    id: "phase5",
    emoji: "🤖",
    label: "Phase 5: AI Pipeline",
    subtitle: "Cartoon, animation, AI video",
    accent: T.iceDim,
    blocks: [
      {
        title: "AI Tool Stack — What Each Tool Does",
        items: [
          { text: "Claude (here): Write all captions, scripts, hooks, carousels, and prompt text in batch. Ask for 7 at once every Sunday.", note: "Paste your content plan → get a full week of copy in 2 min" },
          { text: "CapCut: All video editing. Templates, auto captions, beat sync, transitions.", link: "https://www.capcut.com", linkLabel: "CapCut" },
          { text: "Canva: All static posts, carousels, Story graphics, Adventure Cards, media kit.", link: "https://www.canva.com", linkLabel: "Canva" },
          { text: "Runway Gen-3: Animate still photos of Bailey — turn a great photo into a 4-sec clip.", link: "https://runwayml.com", linkLabel: "RunwayML" },
          { text: "Pika Labs: Short animated clips. Upload Bailey photo → animate running, tail wagging, turning.", link: "https://pika.art", linkLabel: "Pika.art" },
          { text: "Adobe Firefly: Illustrated/cartoon Bailey images for brand graphics and sticker packs.", link: "https://firefly.adobe.com", linkLabel: "Adobe Firefly" },
          { text: "Jitter: Motion graphics for PawStreak intros — app icon bounce, paw trail animation.", link: "https://jitter.video", linkLabel: "Jitter.video (free)" },
          { text: "Google Photos: Auto-backup all raw content. Source of truth for your archive.", link: "https://photos.google.com", linkLabel: "Google Photos" },
        ]
      },
      {
        title: "AI Content Workflows",
        items: [
          { text: "Workflow A — Animated clip from still photo: Great photo → Runway/Pika → CapCut add Adventure Card → post as Signature Short", note: "Use this when you haven't filmed anything new that week" },
          { text: "Workflow B — Cartoon sticker pack: Adobe Firefly prompt → 8–10 Bailey expressions/poses → save as PNG → use in Stories + video overlays", note: "Sticker packs become brand assets. Every big pet account has them." },
          { text: "Workflow C — AI carousel: Describe 5 photos to Claude → get 6-slide caption story → build in Canva → post", note: "Try: 'Write a 6-slide carousel about a husky's first snow. Funny, one line per slide.'" },
          { text: "Workflow D — Voiceover reel: Film Bailey doing something → Claude writes narration script → record in CapCut → add ambient sound", },
        ]
      },
      {
        title: "Where to Automate vs. Where to Stay Human",
        items: [
          { text: "AUTOMATE: Caption drafts, hashtag research, scheduling, cross-posting, thumbnail creation", note: "These are repetitive and low-stakes — let AI handle them" },
          { text: "STAY HUMAN: Choosing which content to post, emotional storytelling, deciding the narrative arc, responding to comments", note: "Authenticity is your actual product. Don't automate the soul." },
          { text: "AUTOMATE: Sunday batch scheduling — one session, whole week queued", },
          { text: "STAY HUMAN: The 'Dad Wednesday' energy, the chaotic moments, anything that requires your voice", },
        ]
      }
    ]
  },
  {
    id: "phase6",
    emoji: "📊",
    label: "Phase 6: Growth + Analytics",
    subtitle: "What to track and when",
    accent: T.coral,
    blocks: [
      {
        title: "Weekly Metrics to Track (10 min every Sunday)",
        items: [
          { text: "IG: Follower count, reach, profile visits, top post saves", note: "Saves = the most important metric on Instagram. Saves = reach." },
          { text: "TikTok: Follower count, video views, watch time %, top video", note: "Watch time % under 30% = hook needs fixing" },
          { text: "Log everything in your Notion Analytics page — 5 rows, one per week", },
          { text: "After 4 weeks: identify your top 3 performing post types and do more of those", },
        ]
      },
      {
        title: "Growth Milestones + What to Do at Each",
        items: [
          { text: "0–1K followers: Focus entirely on content quality. Post consistently. Don't pitch anyone.", note: "The algorithm rewards consistency more than virality at this stage" },
          { text: "1K–5K: Start engaging with similar accounts. Comment genuinely on dog/adventure content daily.", note: "10 real comments/day outperforms any hashtag strategy" },
          { text: "5K–10K: Build media kit. Start soft-pitching local/small brands. Tag products you already use.", },
          { text: "10K+: Open creator marketplace on TikTok and Instagram. Apply to affiliate programs.", link: "https://www.tiktok.com/creator-academy/en/article/creator-marketplace", linkLabel: "TikTok Creator Marketplace" },
        ]
      },
      {
        title: "Brand Deal Targets by Tier",
        items: [
          { text: "Tier 1 — Dog food/treats: Ollie, The Farmer's Dog, Stella & Chewy's", link: "https://www.thefarmersdog.com/ambassador", linkLabel: "Farmer's Dog ambassador program" },
          { text: "Tier 1 — Adventure gear: Ruffwear, Kurgo, Hurtta — perfect match for your content", link: "https://www.ruffwear.com", linkLabel: "Ruffwear" },
          { text: "Tier 2 — Lifestyle: Hydro Flask, Yeti, REI — dogs + outdoor = exact audience", },
          { text: "Tier 2 — Pet insurance: Lemonade, Spot, Healthy Paws — high repeat collab potential", },
          { text: "Tier 3 — Local: coffee shops, breweries, trails, dog-friendly patios — tag generously, let it happen organically", note: "Local collabs are easiest to land and they always reshare your content" },
        ]
      }
    ]
  },
  {
    id: "prompts",
    emoji: "💬",
    label: "Prompt Library",
    subtitle: "Ready-to-use AI prompts",
    accent: T.amberDim,
    blocks: [
      {
        title: "Caption Writing Prompts (Paste into Claude)",
        items: [
          { text: "Batch captions: 'Write 7 Instagram captions for a husky adventure account. Themes: [Monday=mountain, Tuesday=bestfriends, Wednesday=dad chaos, Thursday=throwback, Friday=beach, Saturday=social, Sunday=still]. Tone: cinematic, funny, heartfelt. Under 100 words each. End each with a question CTA.'", note: "Run this every Sunday. Done in 60 seconds." },
          { text: "Carousel story: 'Write a 6-slide carousel story about a husky experiencing [situation] for the first time. Funny, one punchy line per slide. Last slide = soft follow CTA.'", },
          { text: "PawStreak caption: 'Write a 3-line TikTok caption for a video of a husky completing her Shore Patrol adventure. Mention a streak number. End with: Does your dog have a streak? PawStreak — free in bio.'", },
          { text: "Emotional post: 'Write a short Instagram caption about how finite our time is with our dogs. Warm, cinematic, not cheesy. Under 60 words. End with a line that makes someone want to go on a walk right now.'", },
        ]
      },
      {
        title: "AI Image / Animation Prompts",
        items: [
          { text: "Firefly cartoon: 'Illustration of a cream husky dog on a snowy mountain, warm amber tones, adventure sticker style, clean white background, no text, thick outline'", link: "https://firefly.adobe.com", linkLabel: "Adobe Firefly" },
          { text: "Firefly sticker: 'Cute sticker of a cream husky with sunglasses on a beach, cartoon style, amber and cream color palette, transparent background'", },
          { text: "Runway animation prompt: 'The dog slowly turns her head toward the camera, tail begins wagging, soft natural light, cinematic'", link: "https://runwayml.com", linkLabel: "RunwayML" },
          { text: "Pika animation prompt: 'Husky dog shakes water off after swimming, slow motion, golden hour light, high detail fur'", link: "https://pika.art", linkLabel: "Pika.art" },
        ]
      },
      {
        title: "Script Prompts for Voiceover Reels",
        items: [
          { text: "Nature doc voiceover: 'Write a 30-second David Attenborough-style narration of a husky discovering a new beach. Deadpan, cinematic, end with something unexpectedly funny.'", },
          { text: "Dad POV: 'Write a 20-second internal monologue from a dog dad watching his husky destroy a sandcastle at the beach. Self-aware, funny, loving.'", },
          { text: "App reveal script: 'Write a 15-second script for a PawStreak app reveal. Opens with the sound of a walk. Ends with: Every streak. Every adventure. Every day you showed up. PawStreak.'", },
        ]
      }
    ]
  },
];

// ── COMPONENTS ───────────────────────────────────────────

function CheckIcon({ done, accent }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
      background: done ? accent : "transparent",
      border: `1.5px solid ${done ? accent : "#554433"}`,
      color: T.dark, fontWeight: 900, fontSize: 11,
      transition: "all 0.15s", cursor: "pointer",
    }}>{done ? "✓" : ""}</span>
  );
}

function TodoItem({ item, done, onToggle, accent }) {
  return (
    <div onClick={onToggle} style={{
      display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
      padding: "11px 14px", borderRadius: 8,
      background: done ? `${accent}12` : "#ffffff06",
      border: `1px solid ${done ? accent + "40" : "#ffffff0c"}`,
      transition: "all 0.15s", marginBottom: 6,
    }}>
      <div style={{ paddingTop: 1 }}><CheckIcon done={done} accent={accent} /></div>
      <div style={{ flex: 1 }}>
        <div style={{
          color: done ? "#554433" : T.cream,
          textDecoration: done ? "line-through" : "none",
          fontSize: 13.5, lineHeight: 1.55,
          fontFamily: "'Source Serif 4', Georgia, serif",
        }}>{item.text}</div>
        {item.link && !done && (
          <a href={item.link} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              marginTop: 5, fontSize: 11.5, color: accent,
              textDecoration: "none", letterSpacing: 0.3,
              borderBottom: `1px solid ${accent}44`,
              fontFamily: "'Source Serif 4', serif",
            }}>↗ {item.linkLabel}</a>
        )}
        {item.note && (
          <div style={{ marginTop: 5, fontSize: 11.5, color: "#7A6050", fontStyle: "italic",
            fontFamily: "'Source Serif 4', serif" }}>{item.note}</div>
        )}
      </div>
    </div>
  );
}

function Block({ block, phaseId, blockIdx, checked, onToggle, accent }) {
  const [open, setOpen] = useState(true);
  const done = block.items.filter((_, i) => checked[`${phaseId}-${blockIdx}-${i}`]).length;
  const pct = Math.round(done / block.items.length * 100);

  return (
    <div style={{
      marginBottom: 16, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${accent}22`,
      background: T.faint,
    }}>
      <div onClick={() => setOpen(o => !o)} style={{
        padding: "14px 18px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `${accent}0e`,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.cream,
            fontFamily: "'Playfair Display', Georgia, serif" }}>{block.title}</div>
          {block.note && <div style={{ fontSize: 11.5, color: "#7A6050", marginTop: 2,
            fontStyle: "italic", fontFamily: "'Source Serif 4', serif" }}>{block.note}</div>}
          <div style={{ fontSize: 11, color: "#664433", marginTop: 3 }}>{done}/{block.items.length} complete</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: pct === 100 ? accent : "#664433" }}>{pct}%</div>
            <div style={{ width: 50, height: 3, borderRadius: 2, background: "#33221A", marginTop: 3 }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: accent, transition: "width 0.3s" }} />
            </div>
          </div>
          <span style={{ color: accent, fontSize: 16, display: "inline-block",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
        </div>
      </div>
      {open && (
        <div style={{ padding: "14px 16px" }}>
          {block.items.map((item, i) => (
            <TodoItem
              key={i} item={item} accent={accent}
              done={!!checked[`${phaseId}-${blockIdx}-${i}`]}
              onToggle={() => onToggle(phaseId, blockIdx, i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotionQuickLinks() {
  const [links, setLinks] = useState(NOTION_PAGES.map(p => ({ ...p })));
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (i, e) => {
    e.stopPropagation();
    setEditing(i);
    setEditVal(links[i].url);
  };

  const saveEdit = (i) => {
    const updated = [...links];
    updated[i] = { ...updated[i], url: editVal };
    setLinks(updated);
    setEditing(null);
  };

  return (
    <div style={{
      margin: "0 0 28px", padding: "20px 22px", borderRadius: 14,
      background: `${T.ice}0e`, border: `1px solid ${T.ice}30`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🗒️</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: T.ice }}>
          Notion Quick Links
        </span>
        <span style={{ fontSize: 11, color: "#665544", marginLeft: 6, fontStyle: "italic",
          fontFamily: "'Source Serif 4', serif" }}>— click ✎ to paste your real Notion URLs</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, marginTop: 12 }}>
        {links.map((page, i) => (
          <div key={i} style={{
            padding: "10px 14px", borderRadius: 8,
            background: "#ffffff08", border: `1px solid ${T.ice}25`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            {editing === i ? (
              <div style={{ display: "flex", gap: 6, flex: 1 }} onClick={e => e.stopPropagation()}>
                <input
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveEdit(i)}
                  autoFocus
                  style={{
                    flex: 1, background: "#1A1208", border: `1px solid ${T.ice}`,
                    borderRadius: 5, padding: "4px 8px", color: T.cream, fontSize: 12,
                    fontFamily: "'Source Serif 4', serif",
                  }}
                  placeholder="Paste Notion URL"
                />
                <button onClick={() => saveEdit(i)} style={{
                  background: T.ice, border: "none", borderRadius: 5, padding: "4px 8px",
                  color: T.dark, cursor: "pointer", fontSize: 12, fontWeight: 700,
                }}>✓</button>
              </div>
            ) : (
              <>
                <a href={page.url} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, color: T.cream, textDecoration: "none", fontSize: 13,
                  fontFamily: "'Source Serif 4', serif",
                }}>
                  <div style={{ fontWeight: 600 }}>{page.label}</div>
                  <div style={{ fontSize: 11, color: "#7A6050", marginTop: 2 }}>{page.desc}</div>
                </a>
                <button onClick={e => startEdit(i, e)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#665544", fontSize: 14, padding: "2px 4px",
                  transition: "color 0.15s",
                }} title="Edit URL">✎</button>
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11.5, color: "#554433", fontStyle: "italic",
        fontFamily: "'Source Serif 4', serif" }}>
        💡 After creating your Notion pages, click ✎ on each card above and paste the real URL. Then this becomes your one-tap daily launchpad.
      </div>
    </div>
  );
}

function DailyChecklist({ checked, onToggle }) {
  const daily = [
    "Open Notion OS and check today's posting calendar",
    "Check if today's post is already scheduled in Later/Buffer",
    "Respond to any comments from yesterday's post",
    "Check PawStreak @account — any DMs or engagement to reply to",
    "Quick 60-sec scroll: note any trending audio or formats worth using",
    "If it's Sunday: run the weekly batch (sort + schedule + captions)",
  ];

  return (
    <div style={{
      margin: "0 0 24px", padding: "18px 20px", borderRadius: 14,
      background: `${T.amber}0a`, border: `1px solid ${T.amber}25`,
    }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700,
        color: T.amber, marginBottom: 12 }}>☀️ Daily Checklist</div>
      {daily.map((task, i) => {
        const key = `daily-${i}`;
        return (
          <div key={i} onClick={() => onToggle(key)} style={{
            display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
            padding: "9px 12px", borderRadius: 7, marginBottom: 5,
            background: checked[key] ? `${T.amber}18` : "#ffffff06",
            border: `1px solid ${checked[key] ? T.amber + "40" : "#ffffff0c"}`,
            transition: "all 0.15s",
          }}>
            <CheckIcon done={!!checked[key]} accent={T.amber} />
            <span style={{
              fontSize: 13, color: checked[key] ? "#554433" : T.cream,
              textDecoration: checked[key] ? "line-through" : "none",
              fontFamily: "'Source Serif 4', serif", lineHeight: 1.5,
            }}>{task}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────

export default function BaileyOS() {
  const [activePhase, setActivePhase] = useState("notion");
  const [checked, setChecked] = useState({});

  const togglePhaseItem = (phaseId, bi, ii) => {
    const key = `${phaseId}-${bi}-${ii}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
  };

  const toggleKey = (key) => {
    setChecked(p => ({ ...p, [key]: !p[key] }));
  };

  const phaseProgress = (phase) => {
    let total = 0, done = 0;
    phase.blocks.forEach((b, bi) => b.items.forEach((_, ii) => {
      total++;
      if (checked[`${phase.id}-${bi}-${ii}`]) done++;
    }));
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  const overall = (() => {
    let total = 0, done = 0;
    PHASES.forEach(phase => {
      const p = phaseProgress(phase);
      total += p.total; done += p.done;
    });
    // add daily
    for (let i = 0; i < 6; i++) { total++; if (checked[`daily-${i}`]) done++; }
    return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
  })();

  const active = PHASES.find(p => p.id === activePhase);

  return (
    <>
      <style>{FONTS}</style>
      <div style={{
        minHeight: "100vh", background: T.dark,
        fontFamily: "'Source Serif 4', Georgia, serif",
        color: T.cream,
        backgroundImage: `radial-gradient(ellipse at 20% 10%, #2A1C0F 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 90%, #1A2A0F 0%, transparent 60%)`,
      }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: "26px 32px 20px",
          borderBottom: `1px solid ${T.amber}22`,
          background: "linear-gradient(180deg, #1C1208 0%, transparent 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                <span style={{ fontSize: 26 }}>🐾</span>
                <h1 style={{
                  margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.5,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  background: `linear-gradient(100deg, ${T.amber} 0%, ${T.cream} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Bailey & PawStreak OS</h1>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: T.muted, letterSpacing: 2.5,
                textTransform: "uppercase", fontFamily: "'Source Serif 4', serif" }}>
                Content Operating System — Start Today
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: T.amber,
                fontFamily: "'Playfair Display', serif" }}>{overall.pct}%</div>
              <div style={{ fontSize: 11, color: T.muted }}>{overall.done} / {overall.total} tasks</div>
              <div style={{ width: 150, height: 4, borderRadius: 2, background: T.faint, marginTop: 6, overflow: "hidden" }}>
                <div style={{ width: `${overall.pct}%`, height: "100%", borderRadius: 2,
                  background: `linear-gradient(90deg, ${T.amber}, ${T.coral})`, transition: "width 0.4s" }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1 }}>

          {/* ── SIDEBAR ── */}
          <div style={{
            width: 210, flexShrink: 0,
            borderRight: `1px solid ${T.amber}15`,
            padding: "18px 10px",
            background: "#0D0B07",
            display: "flex", flexDirection: "column", gap: 4,
            minHeight: "calc(100vh - 90px)",
          }}>
            {PHASES.map(phase => {
              const prog = phaseProgress(phase);
              const isActive = phase.id === activePhase;
              return (
                <button key={phase.id} onClick={() => setActivePhase(phase.id)} style={{
                  background: isActive ? `${phase.accent}18` : "transparent",
                  border: `1px solid ${isActive ? phase.accent + "60" : "transparent"}`,
                  borderRadius: 9, padding: "11px 12px",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <span style={{ fontSize: 14 }}>{phase.emoji}</span>
                    <span style={{
                      fontSize: 12.5, fontWeight: 700,
                      color: isActive ? phase.accent : T.cream,
                      fontFamily: "'Playfair Display', serif",
                    }}>{phase.label}</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#554433", paddingLeft: 21, marginBottom: 5 }}>{phase.subtitle}</div>
                  <div style={{ paddingLeft: 21 }}>
                    <div style={{ height: 2, borderRadius: 1, background: "#221810", overflow: "hidden" }}>
                      <div style={{ width: `${prog.pct}%`, height: "100%", borderRadius: 1,
                        background: phase.accent, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ fontSize: 9.5, color: "#443322", marginTop: 2 }}>{prog.done}/{prog.total}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "26px 30px", maxWidth: 820 }}>

            {/* Notion Quick Links — always visible */}
            <NotionQuickLinks />

            {/* Daily Checklist — always visible */}
            <DailyChecklist checked={checked} onToggle={toggleKey} />

            {/* Phase Content */}
            <div style={{ marginBottom: 22 }}>
              <h2 style={{
                margin: "0 0 3px", fontSize: 22, fontWeight: 900,
                color: active.accent, fontFamily: "'Playfair Display', serif",
              }}>{active.emoji} {active.label}</h2>
              <p style={{ margin: 0, color: "#7A6050", fontSize: 13 }}>{active.subtitle}</p>
            </div>

            {active.blocks.map((block, bi) => (
              <Block
                key={bi}
                block={block}
                phaseId={active.id}
                blockIdx={bi}
                checked={checked}
                onToggle={togglePhaseItem}
                accent={active.accent}
              />
            ))}
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: "12px 30px",
          borderTop: `1px solid ${T.amber}15`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#0D0B07", fontSize: 11.5, color: "#443322",
          fontFamily: "'Source Serif 4', serif",
        }}>
          <span>🐾 Bailey & Meiomi — Content Operating System</span>
          <span style={{ color: T.amberDim }}>PawStreak — every walk worth remembering</span>
        </div>
      </div>
    </>
  );
}
