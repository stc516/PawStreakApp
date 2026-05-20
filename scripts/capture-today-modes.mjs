import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const OUT = path.resolve('screenshots/launch')

async function advancePrimary(page) {
  await page.getByTestId('onboarding-primary-button').click()
}

async function completeOnboarding(page) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`${BASE}/`)

  await page.getByTestId('dog-name-input').fill('Bailey')
  await advancePrimary(page)
  await advancePrimary(page)
  await advancePrimary(page)
  await page.getByRole('button', { name: /Social Butterfly/ }).click()
  await advancePrimary(page)
  await page.getByRole('button', { name: /Steady Adventurer/ }).click()
  await advancePrimary(page)
  await advancePrimary(page)
  await page.getByPlaceholder('92107').fill('92104')
  await advancePrimary(page)
  await advancePrimary(page)
  await page.waitForURL(/\/app/)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()

  await completeOnboarding(page)
  await page.waitForSelector('[data-dashboard-mode="anticipation"]')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, 'anticipation-mode.png'), fullPage: true })

  await page.getByTestId('dashboard-start-adventure-cta').click()
  await page.getByRole('button', { name: 'Start' }).first().click()
  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByTestId('adventure-complete-headline').waitFor({ state: 'visible', timeout: 20_000 })
  await page.getByTestId('memory-seal-continue').click({ timeout: 25_000 })
  await page.waitForURL(/\/app/)

  await page.waitForSelector('[data-dashboard-mode="afterglow"]')
  await page.waitForSelector('[data-testid="memory-return-strip"]')
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, 'afterglow-mode.png'), fullPage: true })

  await browser.close()
  console.log(`Today mode screenshots saved to ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
