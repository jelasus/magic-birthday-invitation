import { CARD_POOL, pickCard } from '@/lib/cards'

describe('cards', () => {
  it('has five fully-populated card identities', () => {
    expect(CARD_POOL).toHaveLength(5)
    for (const c of CARD_POOL) {
      expect(c.id).toBeTruthy()
      expect(c.art).toMatch(/^\/images\/art\/.+\.jpg$/)
      expect(c.title).toBeTruthy()
      expect(c.typeLine).toBeTruthy()
      expect(c.cost.length).toBeGreaterThan(0)
      expect(Array.isArray(c.colors)).toBe(true)
      expect(c.flavor).toBeTruthy()
    }
  })

  it('is deterministic for the same seed and varies across seeds', () => {
    expect(pickCard('Brayan')).toBe(pickCard('Brayan'))
    const seeds = ['Ana', 'Beto', 'Carla', 'Diego', 'Eva', 'Frank', 'Gabriela', 'Hugo']
    expect(new Set(seeds.map(s => pickCard(s).id)).size).toBeGreaterThan(1)
  })

  it('returns a pool member with no seed', () => {
    expect(CARD_POOL).toContain(pickCard())
    expect(CARD_POOL).toContain(pickCard(''))
    expect(CARD_POOL).toContain(pickCard(null))
  })
})
