import { hexLuminance, readableOn } from '@/lib/contrast'

describe('contrast', () => {
  it('computes luminance of pure white as ~1 and black as 0', () => {
    expect(hexLuminance('#ffffff')).toBeCloseTo(1, 2)
    expect(hexLuminance('#000000')).toBe(0)
  })

  it('returns 0 for malformed hex', () => {
    expect(hexLuminance('#abc')).toBe(0)
  })

  it('picks dark ink on light backgrounds and light parchment on dark', () => {
    expect(readableOn('#f4ecd8')).toBe('#15110a')
    expect(readableOn('#0a0a0a')).toBe('#f4ecd8')
  })
})
