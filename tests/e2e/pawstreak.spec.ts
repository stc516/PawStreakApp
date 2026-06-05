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

type MockLocation = {
  label: string
  zip: string
  city: string
  district: string
  region: string
  country?: string
  lat: number
  lng: number
  mapboxId: string
  relevance?: number
}

async function installMapboxForwardMock(
  page: Page,
  locations: Record<string, MockLocation | null>,
) {
  await page.route(/api\.mapbox\.com\/search\/geocode\/v6\/forward/, async (route) => {
    const url = new URL(route.request().url())
    const q = url.searchParams.get('q') ?? ''
    const location = locations[q] ?? null
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        features: location
          ? [
              {
                id: location.mapboxId,
                properties: {
                  name: location.city,
                  full_address: location.label,
                  mapbox_id: location.mapboxId,
                  relevance: location.relevance ?? 0.96,
                  match_code: { confidence: 'high' },
                  coordinates: { latitude: location.lat, longitude: location.lng },
                  context: {
                    postcode: { name: location.zip },
                    place: { name: location.city },
                    district: { name: location.district },
                    region: { name: location.region },
                    country: { name: location.country ?? 'United States' },
                  },
                },
              },
            ]
          : [],
      }),
    })
  })
}

async function enableTestGeocoding(page: Page) {
  await page.evaluate(() => {
    ;(window as Window & { __PAWSTREAK_MAPBOX_ACCESS_TOKEN?: string })
      .__PAWSTREAK_MAPBOX_ACCESS_TOKEN = 'test-token'
    window.localStorage.setItem('pawstreak-mapbox-test-token', 'test-token')
    window.localStorage.setItem('pawstreak-force-local-expansion-requests', 'true')
  })
}

async function enterActiveAdventure(page: Page) {
  await page.getByTestId('dashboard-start-adventure-cta').click()
  await expect(page).toHaveURL(/\/adventure/)
  await page.getByRole('button', { name: 'Start' }).first().click()
  await expect(page.getByRole('button', { name: /Wrap adventure/ })).toBeVisible()
}

/** Finish walk → Memory Seal → reflection skip → Today (reduced-motion timings in playwright.config). */
async function completeMemorySealToToday(page: Page) {
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await expect(page.getByTestId('adventure-complete-modal')).toBeVisible()
  await expect(page.getByTestId('adventure-complete-headline')).toBeVisible({ timeout: 14_000 })
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 22_000 })
  await page.getByTestId('memory-seal-continue').click()
  await expect(page.getByTestId('adventure-reflection-modal')).toBeVisible({ timeout: 8000 })
  await page.getByTestId('adventure-reflection-skip').click()
  await expect(page).toHaveURL(/\/app/)
}

async function completeOnboarding(page: Page, options: { dogName: string; zip: string }) {
  await installMapboxForwardMock(page, {
    [options.zip]: {
      label: `San Diego, California ${options.zip}, United States`,
      zip: options.zip,
      city: 'San Diego',
      district: 'San Diego County',
      region: 'California',
      lat: 32.7492,
      lng: -117.1304,
      mapboxId: `postcode.${options.zip}`,
    },
  })
  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

  await expect(page.getByTestId('onboarding-welcome')).toBeVisible()
  await page.getByTestId('dog-name-input').fill(options.dogName)
  await advancePrimary(page)

  await expect(page.getByTestId('first-adventure-intro')).toBeVisible()
  await advancePrimary(page)

  await expect(page.getByTestId('dog-details-step')).toBeVisible()
  await advancePrimary(page)

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)

  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)

  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill(options.zip)
  await page.getByPlaceholder('92107').blur()
  await advancePrimary(page)

  await advancePrimary(page)
  await expect(page).toHaveURL(/\/app/)
}

test('fresh onboarding with San Diego CA shows curated SD spots', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await installMapboxForwardMock(page, {
    'San Diego, CA': {
      label: 'San Diego, California 92104, United States',
      zip: '92104',
      city: 'San Diego',
      district: 'San Diego County',
      region: 'California',
      lat: 32.7492,
      lng: -117.1304,
      mapboxId: 'place.sd-test',
    },
  })
  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

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
  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill('San Diego, CA')
  await page.getByPlaceholder('92107').blur()
  await expect(page.getByText('Local tuning ready for')).toBeVisible()
  await advancePrimary(page)

  await advancePrimary(page)

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-app-title')).toHaveText('PawStreak')
  await expect(page.getByTestId('dashboard-hero-status')).toHaveText('TestDog')
  await expect(page.getByTestId('dashboard-adventure-chips')).toBeVisible()
  const stored = await page.evaluate(() => {
    return JSON.parse(window.localStorage.getItem('pawstreak_demo_state_v4') ?? '{}')
  })
  expect(stored.userProfile.homeRawLocationInput).toBe('San Diego, CA')
  expect(stored.userProfile.homeResolvedCity).toBe('San Diego')
  expect(stored.userProfile.homeResolvedState).toBe('California')
  expect(stored.userProfile.homeMapboxPlaceId).toBe('place.sd-test')
  expect(stored.userProfile.homeSupportedMarket).toBe('san-diego')
  expect(stored.generatedMission.marketId).toBe('san-diego')
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('fresh onboarding with Orange County CA shows curated OC spots', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await installMapboxForwardMock(page, {
    'Orange County, CA': {
      label: 'Orange County, California 92648, United States',
      zip: '92648',
      city: 'Huntington Beach',
      district: 'Orange County',
      region: 'California',
      lat: 33.6595,
      lng: -117.9988,
      mapboxId: 'place.oc-test',
    },
  })
  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

  await page.getByTestId('dog-name-input').fill('OCDog')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill('Orange County, CA')
  await page.getByPlaceholder('92107').blur()
  await expect(page.getByText('Local tuning ready for')).toBeVisible()
  await advancePrimary(page)
  await advancePrimary(page)

  await expect(page).toHaveURL(/\/app/)
  const stored = await page.evaluate(() => {
    return JSON.parse(window.localStorage.getItem('pawstreak_demo_state_v4') ?? '{}')
  })
  expect(stored.userProfile.homeSupportedMarket).toBe('orange-county')
  expect(stored.generatedMission.marketId).toBe('orange-county')
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('fresh onboarding with Forest Hills NY uses generic categories and requests expansion', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await page.addInitScript(() => {
    ;(window as Window & { __PAWSTREAK_MAPBOX_ACCESS_TOKEN?: string })
      .__PAWSTREAK_MAPBOX_ACCESS_TOKEN = 'test-token'
  })
  await installMapboxForwardMock(page, {
    'Forest Hills, NY': {
      label: 'Forest Hills, Queens, New York 11375, United States',
      zip: '11375',
      city: 'Forest Hills',
      district: 'Queens County',
      region: 'New York',
      lat: 40.7181,
      lng: -73.8448,
      mapboxId: 'place.forest-hills-test',
    },
  })

  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

  await page.getByTestId('dog-name-input').fill('QueensDog')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill('Forest Hills, NY')
  await page.getByPlaceholder('92107').blur()
  await expect(page.getByText(/We don’t have curated local spots here yet/)).toBeVisible()
  await advancePrimary(page)
  await advancePrimary(page)

  await expect(page).toHaveURL(/\/app/)
  await page.waitForFunction(() => {
    const expansion = JSON.parse(
      window.localStorage.getItem('pawstreak-location-expansion-requests') ?? '[]',
    )
    return expansion.length > 0
  })
  const stored = await page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('pawstreak_demo_state_v4') ?? '{}')
    const expansion = JSON.parse(
      window.localStorage.getItem('pawstreak-location-expansion-requests') ?? '[]',
    )
    return { state, expansion }
  })

  expect(stored.state.userProfile.homeZip).toBe('11375')
  expect(stored.state.userProfile.homeRawLocationInput).toBe('Forest Hills, NY')
  expect(stored.state.userProfile.homeResolvedCity).toBe('Forest Hills')
  expect(stored.state.userProfile.homeResolvedState).toBe('New York')
  expect(stored.state.userProfile.homeMapboxPlaceId).toBe('place.forest-hills-test')
  expect(stored.state.userProfile.homeSupportedMarket).toBeNull()
  expect(stored.state.generatedMission.localSpotId).toBeUndefined()
  expect(stored.state.generatedMission.marketId).toBeUndefined()
  await expect(page.getByRole('button', { name: 'Neighborhood walk' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dog park' })).toBeVisible()
  expect(stored.expansion.at(-1)?.rawLocationInput).toBe('Forest Hills, NY')
  expect(stored.expansion.at(-1)?.geocodedLocation?.region).toBe('New York')
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('fresh onboarding with Chicago IL uses unsupported behavior', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await installMapboxForwardMock(page, {
    'Chicago, IL': {
      label: 'Chicago, Illinois 60614, United States',
      zip: '60614',
      city: 'Chicago',
      district: 'Cook County',
      region: 'Illinois',
      lat: 41.92,
      lng: -87.65,
      mapboxId: 'place.chicago-test',
    },
  })
  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

  await page.getByTestId('dog-name-input').fill('ChicagoDog')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill('Chicago, IL')
  await page.getByPlaceholder('92107').blur()
  await expect(page.getByText(/We don’t have curated local spots here yet/)).toBeVisible()
  await advancePrimary(page)
  await advancePrimary(page)

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByRole('button', { name: 'Neighborhood walk' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dog park' })).toBeVisible()
  const stored = await page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('pawstreak_demo_state_v4') ?? '{}')
    const expansion = JSON.parse(
      window.localStorage.getItem('pawstreak-location-expansion-requests') ?? '[]',
    )
    return { state, expansion }
  })
  expect(stored.state.userProfile.homeSupportedMarket).toBeNull()
  expect(stored.state.generatedMission.localSpotId).toBeUndefined()
  expect(stored.expansion.at(-1)?.rawLocationInput).toBe('Chicago, IL')
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('onboarding invalid location asks for clarification', async ({ page }) => {
  await installMapboxForwardMock(page, { 'Not A Real Place Nope': null })
  await clearStorageAndOpen(page)
  await enableTestGeocoding(page)

  await page.getByTestId('dog-name-input').fill('LostDog')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)

  await page.getByPlaceholder('92107').fill('Not A Real Place Nope')
  await page.getByPlaceholder('92107').blur()
  await expect(page.getByText(/couldn’t verify that location/i)).toBeVisible()
  await expect(page).not.toHaveURL(/\/app/)
})

test('onboarding blank location cannot continue', async ({ page }) => {
  await clearStorageAndOpen(page)
  await page.getByTestId('dog-name-input').fill('BlankDog')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)

  await expect(page.getByTestId('onboarding-primary-button')).toBeDisabled()
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
  await advancePrimary(page)
  await expect(page.getByTestId('first-adventure-intro')).toBeVisible()
  await expect(page.getByText("Your dog's first adventure is waiting.")).toBeVisible()
  await advancePrimary(page)

  await expect(page.getByTestId('dog-details-step')).toBeVisible()
  await expect(page.getByTestId('dog-name-input')).toHaveValue('')
})

test('dashboard persistence after refresh', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PersistDog', zip: '92104' })
  await page.reload()

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-app-title')).toHaveText('PawStreak')
  await expect(page.getByTestId('dashboard-hero-status')).toHaveText('PersistDog')
})

test('bottom nav visits core tabs without blank screens', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'NavDog', zip: '92104' })

  await page.getByRole('link', { name: 'Plan' }).click()
  await expect(page).toHaveURL(/\/adventure/)
  await expect(page.getByText('What should we do next?')).toBeVisible()

  await page.getByRole('link', { name: 'Journey' }).click()
  await expect(page).toHaveURL(/\/story/)
  await expect(page.getByRole('heading', { name: 'This Month With NavDog' })).toBeVisible()

  await page.getByRole('link', { name: 'Path' }).click()
  await expect(page).toHaveURL(/\/wild/)
  await expect(page.getByRole('heading', { name: 'Path' })).toBeVisible()

  await page.getByRole('link', { name: 'Profile' }).click()
  await expect(page).toHaveURL(/\/account/)
  await expect(page.getByTestId('account-page')).toBeVisible()

  await page.getByRole('link', { name: 'Today' }).click()
  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('dashboard-adventure-chips')).toBeVisible()
})

test('dashboard stats row links to path', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'LevelDog', zip: '92104' })

  await expect(page.getByTestId('dashboard-stats-row')).toBeVisible()

  await page.getByTestId('dashboard-the-wild-cta').click()
  await expect(page).toHaveURL(/\/wild$/)
})

test('Path page shows progression nodes', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'WildDog', zip: '92104' })

  await page.goto('/wild')
  await expect(page.getByTestId('wild-page')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Path' })).toBeVisible()
  await expect(page.getByTestId('wild-current-card')).toContainText('WildDog')

  for (let level = 1; level <= 6; level += 1) {
    await expect(page.getByTestId(`wild-tier-${level}`)).toBeVisible()
  }
  const currentTiers = page.locator('[data-testid^="wild-tier-"][data-current="true"]')
  await expect(currentTiers).toHaveCount(1)
})

test('challenge detail shows path map and seasonal filtering', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ChallengeDog', zip: '92104' })

  await page.goto('/packs')
  await expect(page.getByRole('heading', { name: 'Challenges' })).toBeVisible()
  await expect(page.getByText('Holiday Adventure Challenge')).toHaveCount(0)

  await page.getByTestId('pack-card-beach-explorer').click()
  await expect(page).toHaveURL(/\/packs\/beach-explorer/)
  await expect(page.getByTestId('challenge-detail-page')).toBeVisible()
  await expect(page.getByTestId('challenge-detail-map')).toContainText('Challenge map')
  await expect(page.getByTestId('challenge-detail-progress-note')).toContainText(
    'Complete beach, shore, or salt-air adventures',
  )
})

test('adventure generation and Memory Seal appears', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ModalDog', zip: '92104' })
  await enterActiveAdventure(page)
  await page.getByRole('button', { name: /Wrap adventure/ }).click()

  await expect(page.getByRole('dialog', { name: 'Memory' })).toBeVisible()
  await expect(page.getByTestId('adventure-complete-headline')).toBeVisible({ timeout: 14_000 })
  await expect(page.getByText(/saved to journey/i)).toBeVisible({ timeout: 22_000 })
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible({ timeout: 22_000 })
})

test('Memory Seal completes to Today without reward screen', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'SealDog', zip: '92104' })
  await enterActiveAdventure(page)
  await completeMemorySealToToday(page)
  await expect(page.getByTestId('memory-return-strip')).toBeVisible()
})

test('account status chip routes to profile', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'AccountDog', zip: '92104' })

  const chip = page.getByTestId('account-status-chip')
  await expect(chip).toBeVisible()
  await expect(chip).toHaveAttribute('data-state', 'local')
  await chip.click()

  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByTestId('account-page')).toBeVisible()
  await expect(page.getByText(/Save AccountDog's story|Connect Supabase/)).toBeVisible()

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

  await enterActiveAdventure(page)
  await completeMemorySealToToday(page)
  await expect(page.getByTestId('save-progress-nudge')).toBeVisible()
})

test('post-adventure save prompt appears after first completed adventure', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PromptDog', zip: '92104' })

  await enterActiveAdventure(page)
  await completeMemorySealToToday(page)

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

  await expect(page.getByTestId('dashboard-hero-status')).toContainText('MemoryDog')

  await enterActiveAdventure(page)
  await expect(page.getByTestId('adventure-send-off')).toBeVisible()
  await expect(page.getByTestId('adventure-milestone-eyebrow')).toBeVisible()

  await page.getByTestId('adventure-memory-input').fill('Chased a leaf across the whole block.')

  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await expect(page.getByTestId('adventure-complete-modal')).toBeVisible()
  await expect(page.getByTestId('adventure-complete-headline')).toBeVisible({ timeout: 14_000 })
  await expect(page.getByTestId('adventure-complete-headline')).not.toContainText('had a great day')
  await expect(page.getByTestId('adventure-complete-memory')).toContainText('Chased a leaf', {
    timeout: 20_000,
  })

  await page.getByTestId('memory-seal-continue').click({ timeout: 22_000 })
  await expect(page.getByTestId('adventure-reflection-modal')).toBeVisible({ timeout: 8000 })
  await page.getByTestId('adventure-reflection-skip').click()
  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByTestId('memory-return-strip')).toBeVisible()
})

test('category chip updates today recommendation', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ChipDog', zip: '92104' })

  const titleBefore = await page.getByTestId('dashboard-gm-title').innerText()
  await page.getByRole('button', { name: 'Trail' }).click()
  await expect(page.getByTestId('dashboard-gm-title')).not.toHaveText(titleBefore)
})

test('no console errors during main flow', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await completeOnboarding(page, { dogName: 'ConsoleDog', zip: '92104' })
  await enterActiveAdventure(page)
  await completeMemorySealToToday(page)

  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})
