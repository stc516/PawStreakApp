import { describe, expect, it } from 'vitest'

import { visibleMonthlyPacks } from '../../src/data/monthlyPacks'

describe('challenge season filtering', () => {
  it('shows evergreen challenges and hides winter holiday challenge in June', () => {
    const june = new Date('2026-06-05T12:00:00')
    const packs = visibleMonthlyPacks(june)
    const titles = packs.map((pack) => pack.title)

    expect(titles).toContain('Beach Explorer')
    expect(titles).toContain('Trail Scout')
    expect(titles).toContain('Neighborhood Navigator')
    expect(titles).not.toContain('Holiday Adventure Challenge')
  })

  it('shows the holiday challenge in winter', () => {
    const december = new Date('2026-12-10T12:00:00')
    const titles = visibleMonthlyPacks(december).map((pack) => pack.title)

    expect(titles).toContain('Holiday Adventure Challenge')
  })
})
