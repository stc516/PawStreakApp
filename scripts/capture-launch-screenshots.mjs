import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'
const OUT = path.resolve('screenshots/launch')

async function advancePrimary(page) {
  await page.getByTestId('onboarding-primary-button').click()
}

async function completeOnboarding(page, dogName) {
  await page.goto(`${BASE}/`)
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`${BASE}/`)

  await page.getByTestId('dog-name-input').fill(dogName)
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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  await completeOnboarding(page, 'Bailey')

  await page.goto(`${BASE}/app`)
  await page.waitForTimeout(400)
  const shots = [
    { url: `${BASE}/app`, files: ['today.png', 'app.png'] },
    { url: `${BASE}/adventure`, files: ['plan.png', 'adventure-plan.png'] },
  ]

  for (const { url, files } of shots) {
    await page.goto(url)
    await page.waitForTimeout(400)
    for (const file of files) {
      await page.screenshot({ path: path.join(OUT, file), fullPage: true })
    }
  }

  await page.getByRole('button', { name: 'Start' }).first().click()
  await page.waitForTimeout(600)
  for (const file of ['active.png', 'adventure-active.png']) {
    await page.screenshot({ path: path.join(OUT, file), fullPage: true })
  }

  await page.getByRole('button', { name: /Wrap adventure/ }).click()
  await page.getByRole('button', { name: 'Done' }).click()
  await page.waitForURL(/\/reward/, { timeout: 15_000 })
  await page.waitForTimeout(800)
  for (const file of ['reward.png']) {
    await page.screenshot({ path: path.join(OUT, file), fullPage: true })
  }

  const tabShots = [
    { url: `${BASE}/story`, files: ['journey.png', 'story.png'] },
    { url: `${BASE}/wild`, files: ['path.png', 'wild.png'] },
    { url: `${BASE}/account`, files: ['profile.png', 'account.png'] },
  ]
  for (const { url, files } of tabShots) {
    await page.goto(url)
    await page.waitForTimeout(400)
    for (const file of files) {
      await page.screenshot({ path: path.join(OUT, file), fullPage: true })
    }
  }

  await browser.close()
  console.log(`Screenshots saved to ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
