/**
 * Generates PWA PNG icons (Apple touch icon + manifest icons) from the
 * source SVGs in /public, using the headless Chromium that's already
 * installed for Playwright e2e tests. No new dependencies required.
 *
 * Run after editing public/icon.svg or public/icon-maskable.svg:
 *   node scripts/generate-pwa-icons.mjs
 */
import { chromium } from '@playwright/test'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')

const targets = [
  { source: 'icon.svg', out: 'apple-touch-icon.png', size: 180, bg: '#0d1117' },
  { source: 'icon.svg', out: 'icon-192.png', size: 192, bg: '#0d1117' },
  { source: 'icon.svg', out: 'icon-512.png', size: 512, bg: '#0d1117' },
  { source: 'icon-maskable.svg', out: 'maskable-icon-512.png', size: 512, bg: '#0d1117' },
]

async function readSvg(file) {
  return fs.readFile(path.join(publicDir, file), 'utf8')
}

function pageHtml({ svg, size, bg }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: ${bg}; }
      body { width: ${size}px; height: ${size}px; }
      svg { width: ${size}px; height: ${size}px; display: block; }
    </style>
  </head>
  <body>${svg}</body>
</html>`
}

async function generate() {
  const browser = await chromium.launch()
  try {
    for (const target of targets) {
      const svg = await readSvg(target.source)
      const ctx = await browser.newContext({
        viewport: { width: target.size, height: target.size },
        deviceScaleFactor: 1,
      })
      const page = await ctx.newPage()
      await page.setContent(pageHtml({ svg, size: target.size, bg: target.bg }))
      await page.locator('svg').waitFor({ state: 'visible' })
      const buffer = await page.screenshot({
        type: 'png',
        omitBackground: false,
        clip: { x: 0, y: 0, width: target.size, height: target.size },
      })
      const outPath = path.join(publicDir, target.out)
      await fs.writeFile(outPath, buffer)
      const stat = await fs.stat(outPath)
      console.log(`✓ ${target.out} (${target.size}×${target.size}, ${stat.size} bytes)`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}

generate().catch((err) => {
  console.error('Failed to generate PWA icons:', err)
  process.exitCode = 1
})
