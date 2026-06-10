import { frameFor } from '@/lib/frames'

describe('frameFor', () => {
  it('returns an artifact frame for no colors', () => {
    const f = frameFor([])
    expect(f.frameGradient).toContain('linear-gradient')
    expect(f.barColor).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect([f.barInk]).toContain(f.barInk) // present
  })

  it('returns a mono frame for a single color', () => {
    expect(frameFor(['u']).frameGradient).toContain('linear-gradient')
    expect(frameFor(['b']).frameGradient).not.toBe(frameFor(['u']).frameGradient)
  })

  it('returns the gold frame for multicolor', () => {
    const gold = frameFor(['w', 'u', 'b', 'r', 'g'])
    const mono = frameFor(['u'])
    expect(gold.frameGradient).not.toBe(mono.frameGradient)
  })

  it('chooses a readable ink (dark or parchment)', () => {
    expect(['#15110a', '#f4ecd8']).toContain(frameFor(['b']).barInk)
    expect(['#15110a', '#f4ecd8']).toContain(frameFor(['w']).barInk)
  })
})
