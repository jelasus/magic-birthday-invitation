import { MANA, manaInfo } from '@/lib/mana'

describe('mana', () => {
  it('defines all five MTG colors', () => {
    expect(Object.keys(MANA).sort()).toEqual(['b', 'g', 'r', 'u', 'w'])
  })

  it('returns a Spanish label and a pip color for a code', () => {
    const u = manaInfo('u')
    expect(u.label).toMatch(/azul/i)
    expect(u.pipColor).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
