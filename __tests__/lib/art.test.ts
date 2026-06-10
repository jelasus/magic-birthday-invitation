import { ART_POOL, pickArt } from '@/lib/art'

describe('art', () => {
  it('exposes a non-empty pool of /images/art paths', () => {
    expect(ART_POOL.length).toBeGreaterThan(0)
    for (const p of ART_POOL) {
      expect(p).toMatch(/^\/images\/art\/.+\.(jpg|png|svg)$/)
    }
  })

  it('is deterministic for the same seed', () => {
    expect(pickArt('Brayan')).toBe(pickArt('Brayan'))
    expect(pickArt('Alice')).toBe(pickArt('Alice'))
  })

  it('spans more than one pool entry across different seeds', () => {
    const seeds = ['Ana', 'Beto', 'Carla', 'Diego', 'Eva', 'Frank', 'Gabriela', 'Hugo', 'Ivan', 'Julia']
    const chosen = new Set(seeds.map(s => pickArt(s)))
    expect(chosen.size).toBeGreaterThan(1)
  })

  it('returns a pool member when given no seed', () => {
    expect(ART_POOL).toContain(pickArt())
    expect(ART_POOL).toContain(pickArt(''))
    expect(ART_POOL).toContain(pickArt(null))
  })

  it('always returns a member of the pool', () => {
    expect(ART_POOL).toContain(pickArt('whatever-seed'))
  })
})
