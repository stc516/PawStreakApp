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

async function completeOnboarding(page: Page, options: { dogName: string; zip: string }) {
  await clearStorageAndOpen(page)

  await page.getByPlaceholder("Dog's name").fill(options.dogName)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByPlaceholder('92107').fill(options.zip)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('button', { name: 'Start PawStreak' }).click()
  await expect(page).toHaveURL(/\/app/)
}

test('fresh onboarding with supported ZIP 92104', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await clearStorageAndOpen(page)

  await page.getByPlaceholder("Dog's name").fill('TestDog')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByPlaceholder('92107').fill('92104')
  await expect(page.getByText('Local tuning ready for')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Start PawStreak' }).click()

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByText('TestDog is ready. Your first adventure is waiting.')).toBeVisible()
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('fresh onboarding with unsupported ZIP 83702', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await clearStorageAndOpen(page)

  await page.getByPlaceholder("Dog's name").fill('FallbackDog')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByPlaceholder('92107').fill('83702')
  await expect(page.getByText('Local adventure tuning is coming soon for your area')).toBeVisible()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Start PawStreak' }).click()

  await expect(page).toHaveURL(/\/app/)
  await expect(page.getByRole('button', { name: /Start today's adventure/ })).toBeVisible()
  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})

test('dashboard persistence after refresh', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'PersistDog', zip: '92104' })
  await page.reload()

  await expect(page).toHaveURL(/\/app/)
  await expect(page.locator('.hero-name').getByText('PersistDog')).toBeVisible()
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
  await expect(page.getByText("NavDog's Achievements")).toBeVisible()

  await page.getByRole('link', { name: /Story/ }).click()
  await expect(page).toHaveURL(/\/story/)
  await expect(page.getByText("NavDog's Adventures")).toBeVisible()

  await page.getByRole('link', { name: /Today/ }).click()
  await expect(page).toHaveURL(/\/app/)
})

test('adventure generation and completion modal appears', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ModalDog', zip: '92104' })
  await page.getByRole('button', { name: /Start today's adventure/ }).click()
  await expect(page).toHaveURL(/\/adventure/)
  await page.getByRole('button', { name: /Wrap adventure/ }).click()

  await expect(page.getByRole('dialog', { name: 'Adventure complete' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Share Adventure' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()
})

test('Share Adventure fallback/native flow does not crash', async ({ page }) => {
  await completeOnboarding(page, { dogName: 'ShareDog', zip: '92104' })
  await page.getByRole('button', { name: /Start today's adventure/ }).click()
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

test('no console errors during main flow', async ({ page }) => {
  const consoleErrors = attachConsoleErrorCapture(page)
  await completeOnboarding(page, { dogName: 'ConsoleDog', zip: '92104' })
  await page.getByRole('button', { name: /Start today's adventure/ }).click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByRole('button', { name: 'Done' }).click()
  await expect(page).toHaveURL(/\/character-moment/)

  expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
})
