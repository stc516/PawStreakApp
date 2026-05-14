import { expect, test, type Page } from '@playwright/test'

function attachConsoleErrorCapture(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

async function clearStorageAndOpen(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto('/')
}

async function advancePrimary(page: Page) {
  await page.getByTestId('onboarding-primary-button').click()
}

async function completeOnboarding(page: Page, options: { dogName: string; zip: string }) {
  await clearStorageAndOpen(page)

  // Step 1 — Welcome / Dog Name
  await expect(page.getByTestId('onboarding-welcome')).toBeVisible()
  await page.getByTestId('dog-name-input').fill(options.dogName)
  await advancePrimary(page)

  // Step 2 — First Adventure Intro
  await expect(page.getByTestId('first-adventure-intro')).toBeVisible()
  await advancePrimary(page)

  // Step 3 — More Dog Details (skip optional fields)
  await expect(page.getByTestId('dog-details-step')).toBeVisible()
  await advancePrimary(page)

  // Step 4 — Personality
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)

  // Step 5 — Energy
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)

  // Step 6 — Goals (skip)
  await advancePrimary(page)

  // Step 7 — Location / ZIP
  await page.getByPlaceholder('92107').fill(options.zip)
  await advancePrimary(page)

  // Step 8 — Reminders → finish
  await advancePrimary(page)
  await expect(page).toHaveURL(/\/app/)
}

test('fresh onboarding with supported ZIP 92104', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await clearStorageAndOpen(page)

  await expect(page.getByTestId('onboarding-welcome')).toBeVisible()
  await page.getByTestId('dog-name-input').fill('TestDog')
  await expect(page.getByTestId('onboarding-primary-button')).toHaveText(/Meet TestDog/)
  await advancePrimary(page)

  await expect(page.getByTestId('first-adventure-intro')).toBeVisible()
  await expect(page.getByTestId('onboarding-primary-button')).toHaveText(
    /Build TestDog's adventure profile/,
  )
  await advancePrimary(page)

  await expect(page.getByTestId('dog-details-step')).toBeVisible()
  await advancePrimary(page)

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page) // goals (skip)

  await page.getByPlaceholder('92107').fill('92104')
  await expect(page.getByText('Local tuning ready for')).toBeVisible()
  await advancePrimary(page)

  await advancePrimary(page) // reminders → Start PawStreak

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-dog-name')).toHaveText('TestDog')
  await expect(page.getByTestId('dashboard-adventure-chips')).toBeVisible()
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('fresh onboarding with unsupported ZIP 83702', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await clearStorageAndOpen(page)

  await page.getByTestId('dog-name-input').fill('FallbackDog')
  await advancePrimary(page) // welcome
  await advancePrimary(page) // intro
  await advancePrimary(page) // details (skip)

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page) // goals

  await page.getByPlaceholder('92107').fill('83702')
  await expect(page.getByText('Local adventure tuning is coming soon for your area')).toBeVisible()
  await advancePrimary(page)

  await advancePrimary(page) // finish

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-start-adventure-cta')).toBeVisible()
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('welcome step button label updates with name + Google fallback note', async ({ page }) => {
  await clearStorageAndOpen(page)

  await expect(page.getByTestId('onboarding-welcome')).toBeVisible()
  await expect(page.getByTestId('onboarding-primary-button')).toHaveText(/Let's go/)

  await page.getByTestId('dog-name-input').fill('Bailey')
  await expect(page.getByTestId('onboarding-primary-button')).toHaveText(/Meet Bailey/)

  await page.getByTestId('onboarding-google-button').click()
  await expect(page.getByText('Google sign-in coming soon')).toBeVisible()
})

test('empty name does not save Bailey as the dog name', async ({ page }) => {
  await clearStorageAndOpen(page)

  await expect(page.getByTestId('onboarding-welcome')).toBeVisible()
  // Skip the welcome step without entering a name (placeholder only).
  await advancePrimary(page) // welcome → intro
  await expect(page.getByTestId('first-adventure-intro')).toBeVisible()
  await expect(page.getByText("Your dog's first adventure is waiting.")).toBeVisible()
  await advancePrimary(page) // intro → details

  // Step 3 should ask for the name again because none was entered.
  await expect(page.getByTestId('dog-details-step')).toBeVisible()
  await expect(page.getByTestId('dog-name-input')).toHaveValue('')
})

test('dashboard persistence after refresh', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PersistDog', zip: '92104' })
  await page.reload()

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-dog-name')).toHaveText('PersistDog')
  await expect(page.getByRole('heading', { name: 'Dog profile' })).toHaveCount(0)
})

test('tab navigation works without blank screens', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'NavDog', zip: '92104' })

  await page.getByRole('link', { name: /Adventure/ }).click()
  await expect(page).toHaveURL(/\/adventure/)
  await expect(page.getByRole('button', { name: /Wrap adventure/ })).toBeVisible()

  // Adventure screen has no bottom nav; return to dashboard to exercise tab links.
  await page.goto('/app')
  await page.getByRole('link', { name: /Packs/ }).click()
  await expect(page).toHaveURL(/\/packs/)

  await page.getByRole('link', { name: /Finds/ }).click()
  await expect(page).toHaveURL(/\/badges/)
  await expect(page.getByText("NavDog's Finds")).toBeVisible()

  await page.getByRole('link', { name: /Story/ }).click()
  await expect(page).toHaveURL(/\/story/)
  await expect(page.getByText("NavDog's Known World")).toBeVisible()

  await page.getByRole('link', { name: /Today/ }).click()
  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-adventure-chips')).toBeVisible()
})

test('dashboard stats row and link to progress', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'LevelDog', zip: '92104' })

  await expect(page.getByTestId('dashboard-stats-row')).toBeVisible()

  await page.getByTestId('dashboard-the-wild-cta').click()
  await expect(page).toHaveURL(/\/wild$/)
})

test('The Wild page shows current league + league ladder', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'WildDog', zip: '92104' })

  await page.goto('/wild')
  await expect(page.getByTestId('wild-page')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The Wild' })).toBeVisible()
  await expect(page.getByText(/quiet progression layer/)).toBeVisible()

  await expect(page.getByTestId('wild-current-card')).toContainText('WildDog')

  for (let level = 1; level <= 5; level += 1) {
    await expect(page.getByTestId(`wild-tier-${level}`)).toBeVisible()
  }
  // Exactly one tier should be the user's current tier, whichever the seed lands on.
  const currentTiers = page.locator('[data-testid^="wild-tier-"][data-current="true"]')
  await expect(currentTiers).toHaveCount(1)

  await expect(page.getByTestId('wild-coming-soon')).toBeVisible()
})

test('adventure generation and completion modal appears', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ModalDog', zip: '92104' })
  await page.getByTestId('dashboard-start-adventure-cta').click()
  await expect(page).toHaveURL(/\/adventure/)
  await page.getByRole('button', { name: /Wrap adventure/ }).click()

  await expect(page.getByRole('dialog', { name: 'Adventure complete' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Share Adventure' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()
})

test('Share Adventure fallback/native flow does not crash', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ShareDog', zip: '92104' })
  await page.getByTestId('dashboard-start-adventure-cta').click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await expect(page.getByRole('dialog', { name: 'Adventure complete' })).toBeVisible()

  await page.evaluate(() => {
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: async () => undefined,
    })
  })
  await page.getByRole('button', { name: 'Share Adventure' }).click()
  await expect(page.getByText('Shared successfully.')).toBeVisible()

  await page.evaluate(() => {
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => undefined,
      },
    })
  })
  await page.getByRole('button', { name: 'Share Adventure' }).click()
  await expect(page.getByText('Copied summary to clipboard.')).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Adventure complete' })).toBeVisible()
})

test('monthly packs render on dashboard and dedicated /packs page', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PackDog', zip: '92104' })

  await expect(page.getByTestId('dashboard-featured-pack-cta')).toBeVisible()
  await page.getByTestId('dashboard-featured-pack-cta').click()

  await expect(page).toHaveURL(/\/packs$/)
  await expect(page.getByRole('heading', { name: 'World Regions' })).toBeVisible()
  await expect(page.getByTestId('pack-card-coastal-dog')).toBeVisible()
  await expect(page.getByTestId('pack-card-patio-pup')).toBeVisible()
  await expect(page.getByTestId('pack-card-neighborhood-explorer')).toBeVisible()
})

test('account status chip routes to /account in coming-soon mode', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'AccountDog', zip: '92104' })

  const chip = page.getByTestId('account-status-chip')
  await expect(chip).toBeVisible()
  await expect(chip).toHaveAttribute('data-state', 'local')
  await chip.click()

  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId('account-page')).toBeVisible()
  await expect(page.getByTestId('account-auth-not-configured')).toBeVisible()

  // Form is rendered but inputs are disabled when Supabase isn't configured.
  await expect(page.getByTestId('account-email-input')).toBeDisabled()
  await expect(page.getByTestId('account-password-submit')).toBeDisabled()
  await expect(page.getByTestId('account-magic-link')).toBeDisabled()

  await page.getByTestId('account-back').click()
  await expect(page).toHaveURL(/\/app$/)
})

test('save-progress nudge appears, dismisses, and re-surfaces after an adventure', async ({
  page,
}) => {
  await completeOnboarding(page, { dogName: 'NudgeDog', zip: '92104' })

  const nudge = page.getByTestId('save-progress-nudge')
  await expect(nudge).toBeVisible()
  await expect(page.getByTestId('save-progress-nudge-cta')).toBeVisible()

  await page.getByTestId('save-progress-nudge-dismiss').click()
  await expect(nudge).toHaveCount(0)

  // Run a quick adventure → meaningful event → nudge should resurface on dashboard.
  await page.getByTestId('dashboard-start-adventure-cta').click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByRole('button', { name: 'Done' }).click()
  // Through character moment + reward, then back to dashboard.
  await page.goto('/app')
  await expect(page.getByTestId('save-progress-nudge')).toBeVisible()
})

test('post-adventure save prompt appears after first completed adventure', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PromptDog', zip: '92104' })

  await page.getByTestId('dashboard-start-adventure-cta').click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByRole('button', { name: 'Done' }).click()
  await page.goto('/app')

  const prompt = page.getByTestId('post-adventure-save-prompt')
  await expect(prompt).toBeVisible()
  await page.getByTestId('post-adventure-save-prompt-later').click()
  await expect(prompt).toHaveCount(0)
})

test('legal pages render and footer links navigate', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'LegalDog', zip: '92104' })

  await page.getByTestId('footer-privacy-link').click()
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.getByRole('heading', { name: /Privacy, the short version/ })).toBeVisible()

  await page.getByRole('link', { name: 'Terms', exact: true }).first().click()
  await expect(page).toHaveURL(/\/terms$/)
  await expect(page.getByRole('heading', { name: /Terms of using PawStreak/ })).toBeVisible()
})

test('emotional adventure flow: memory captures and headlines stay dog-first', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'MemoryDog', zip: '92104' })

  // Dashboard is dog-first, not stopwatch-first.
  await expect(page.getByTestId('dashboard-hero-status')).toContainText('MemoryDog')

  await page.getByTestId('dashboard-start-adventure-cta').click()
  await expect(page).toHaveURL(/\/adventure/)
  await expect(page.getByTestId('adventure-send-off')).toBeVisible()
  await expect(page.getByTestId('adventure-milestone-eyebrow')).toBeVisible()

  // Capture a memory.
  await page.getByTestId('adventure-memory-input').fill('Chased a leaf across the whole block.')

  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await expect(page.getByTestId('adventure-complete-modal')).toBeVisible()
  await expect(page.getByTestId('adventure-complete-headline')).toContainText('MemoryDog had a great day.')
  await expect(page.getByTestId('adventure-complete-memory')).toContainText('Chased a leaf')

  await page.getByRole('button', { name: 'Done' }).click()
  // Character moment → reward.
  await expect(page).toHaveURL(/\/character-moment/)
  await page.goto('/reward')
  await expect(page.getByTestId('reward-headline')).toContainText('MemoryDog had a great day.')
  await expect(page.getByTestId('reward-memory-card')).toContainText('Chased a leaf')
})

test('no console errors during main flow', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await completeOnboarding(page, { dogName: 'ConsoleDog', zip: '92104' })
  await page.getByTestId('dashboard-start-adventure-cta').click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByRole('button', { name: 'Done' }).click()
  await expect(page).toHaveURL(/\/character-moment/)

  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})
