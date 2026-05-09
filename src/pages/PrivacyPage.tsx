import { LegalLayout, LegalSection } from '../components/legal/LegalLayout'

const LAST_UPDATED = 'May 2026'

export function PrivacyPage() {
  return (
    <LegalLayout eyebrow='How we handle your data' title='Privacy, the short version.' updated={LAST_UPDATED}>
      <p>
        PawStreak is built around your dog, not your data. We collect the minimum we need to make
        adventures feel personal — and we&apos;re upfront about what that looks like.
      </p>

      <LegalSection title='What we store'>
        <p>
          Your onboarding answers — dog name, breed, energy level, goals, reminder cadence — are
          saved on your device first. If you sign in, we sync that same profile through PawStreak&apos;s
          app services so it follows you across devices.
        </p>
        <p>
          We don&apos;t need a dossier on you to suggest a sunset stroll. We only keep what makes the
          experience better.
        </p>
      </LegalSection>

      <LegalSection title='Location'>
        <p>
          Location is used to personalize adventures — weather, nearby parks, neighborhood vibes.
          We don&apos;t broadcast your exact GPS coordinates publicly, and we don&apos;t share precise
          location with third parties.
        </p>
        <p>
          You can use PawStreak without sharing precise location at all. ZIP-level context is
          enough to get the experience going.
        </p>
      </LegalSection>

      <LegalSection title='Analytics'>
        <p>
          We use privacy-focused product analytics so we can see things like &quot;people loved the
          coffee crawl&quot; or &quot;onboarding step 4 confused everyone&quot; and improve from there.
        </p>
        <p>
          We don&apos;t send your dog&apos;s name, your email, your exact ZIP, your GPS coordinates, or
          any free-form text you type into the app. No session replay. No invasive tracking.
        </p>
      </LegalSection>

      <LegalSection title='Notifications'>
        <p>
          If you enable reminders, those are optional and only used to nudge you toward your next
          adventure. You can turn them off any time in your device settings.
        </p>
      </LegalSection>

      <LegalSection title='Installable PWA'>
        <p>
          PawStreak can be installed to your home screen like a native app. Installing doesn&apos;t
          give us new permissions — it just makes the experience faster and feel more like a real
          app on your device.
        </p>
      </LegalSection>

      <LegalSection title='Future social features'>
        <p>
          We&apos;d love to add light social and community features over time — packs, streak shares,
          neighborhood standings. If we ever do, anything social will be opt-in. Your dog&apos;s
          adventures stay yours by default.
        </p>
      </LegalSection>

      <LegalSection title='Selling data — nope'>
        <p>
          We don&apos;t sell your data. We don&apos;t sell your dog&apos;s name. We don&apos;t sell personal
          details. That&apos;s not the business we want to be in.
        </p>
      </LegalSection>

      <LegalSection title='Leaving anytime'>
        <p>
          You can stop using PawStreak whenever you want. Uninstall the app or clear local storage
          and the on-device profile is gone. If you&apos;ve synced an account, you can ask us to
          delete it.
        </p>
      </LegalSection>

      <LegalSection title='Not for emergencies'>
        <p>
          PawStreak is for fun and bonding — adventure ideas, streaks, and silly milestones. It&apos;s
          not a replacement for a veterinarian, trainer, or emergency service. If something is
          wrong with your dog, please call your vet.
        </p>
      </LegalSection>

      <LegalSection title='Questions'>
        <p>
          If something here is unclear or you want your data removed, reach out and we&apos;ll handle
          it like real humans. This page will be updated as PawStreak grows.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}

export default PrivacyPage
