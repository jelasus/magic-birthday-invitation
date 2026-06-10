import { getGuild, randomGuildCode, GUILDS } from '@/lib/colors'

describe('GUILDS', () => {
  it('has exactly 10 guilds', () => {
    expect(Object.keys(GUILDS)).toHaveLength(10)
  })

  it('every guild has required properties', () => {
    Object.values(GUILDS).forEach(guild => {
      expect(guild.code).toBeTruthy()
      expect(guild.name).toBeTruthy()
      expect(guild.frameGradient).toContain('gradient')
      expect(guild.manaColors).toHaveLength(2)
      expect(guild.colors).toHaveLength(2)
      expect(guild.nameBarColor).toMatch(/^#/)
      expect(guild.textBoxColor).toMatch(/^#/)
      expect(guild.borderColor).toMatch(/^#/)
    })
  })
})

describe('getGuild', () => {
  it('returns the correct guild for a valid code', () => {
    expect(getGuild('ub').code).toBe('ub')
    expect(getGuild('ub').name).toBe('Dimir')
  })

  it('handles reversed color order: bu → ub', () => {
    expect(getGuild('bu').code).toBe('ub')
  })

  it('returns uppercase input: UB → ub', () => {
    expect(getGuild('UB').code).toBe('ub')
  })

  it('returns a valid fallback guild for an unknown code', () => {
    const guild = getGuild('xx')
    expect(Object.keys(GUILDS)).toContain(guild.code)
  })
})

describe('randomGuildCode', () => {
  it('returns a valid guild code', () => {
    expect(Object.keys(GUILDS)).toContain(randomGuildCode())
  })
})
