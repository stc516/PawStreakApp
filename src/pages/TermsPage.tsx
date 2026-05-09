import { LegalLayout, LegalSection } from '../components/legal/LegalLayout'

const LAST_UPDATED = 'May 2026'

export function TermsPage() {
  return (
    <LegalLayout eyebrow='The friendly fine print' title='Terms of using PawStreak.' updated={LAST_UPDATED}>
      <p>
        PawStreak is a small, lovingly-built app for turning everyday walks into adventures with
        your dog. By using it, you agree to a few simple things — written here in plain English.
      </p>

      <LegalSection title='What PawStreak actually is'>
        <p>
          PawStreak suggests adventures, tracks streaks, and celebrates milestones. It&apos;s an
          experience, not an authority. Use it for inspiration, not instructions.
        </p>
      </LegalSection>

      <LegalSection title='You know your dog best'>
        <p>
          You&apos;re responsible for your pet&apos;s health, safety, and behavior on every adventure.
          Use common sense — check the weather, watch the trail, respect leash laws, mind hot
          pavement, and skip anything that doesn&apos;t feel right for your dog that day.
        </p>
      </LegalSection>

      <LegalSection title='Public places, parks, and patios'>
        <p>
          Adventure ideas may include parks, trails, cafés, patios, and other public spots. Follow
          local rules and house rules — pet-friendly today doesn&apos;t mean pet-friendly forever, and
          PawStreak doesn&apos;t guarantee any specific venue will welcome dogs.
        </p>
      </LegalSection>

      <LegalSection title='Not medical or veterinary advice'>
        <p>
          Nothing in PawStreak is medical, behavioral, or veterinary advice. If your dog is sick,
          injured, or acting off, please talk to a real vet — not a streak counter.
        </p>
      </LegalSection>

      <LegalSection title='Early access expectations'>
        <p>
          PawStreak is in early access, which means we&apos;re iterating fast. Features may change,
          improve, or quietly disappear. XP, achievements, packs, and standings may be reset or
          recalibrated as the system evolves.
        </p>
        <p>
          We don&apos;t promise uptime, perfect availability, or that any specific feature will stick
          around forever. We do promise to keep making it better.
        </p>
      </LegalSection>

      <LegalSection title='Your account &amp; profile'>
        <p>
          If you create an account, keep your sign-in info to yourself. You&apos;re responsible for
          activity on your account. Don&apos;t use PawStreak to harass anyone, scrape content, or do
          anything illegal — we&apos;ll have to part ways if that happens.
        </p>
      </LegalSection>

      <LegalSection title='Content &amp; sharing'>
        <p>
          When you share an adventure recap, you&apos;re responsible for what gets shared. Only share
          places, photos, or stories you&apos;re comfortable sharing publicly.
        </p>
      </LegalSection>

      <LegalSection title='Liability, in plain English'>
        <p>
          PawStreak is provided as-is. We&apos;re not liable for what happens on your walks, the
          weather, the squirrel that ran out, or any decision you make based on adventure
          suggestions. You and your dog are the team — we&apos;re just the soundtrack.
        </p>
      </LegalSection>

      <LegalSection title='Changes to these terms'>
        <p>
          We&apos;ll update these terms as PawStreak grows. If something material changes, we&apos;ll
          do our best to make it obvious. Continuing to use the app after changes means you&apos;re
          good with the new version.
        </p>
      </LegalSection>

      <LegalSection title='Get in touch'>
        <p>
          Questions, feedback, or a great dog story? We want to hear from you. PawStreak is built
          for the people who actually love walking their dogs — and we listen.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}

export default TermsPage
