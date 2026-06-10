import { getPartyConfig } from '@/lib/config'

describe('getPartyConfig', () => {
  const originalPartyConfig = process.env.PARTY_CONFIG

  afterEach(() => {
    if (originalPartyConfig === undefined) {
      delete process.env.PARTY_CONFIG
    } else {
      process.env.PARTY_CONFIG = originalPartyConfig
    }
  })

  it('reads from PARTY_CONFIG env var when set', () => {
    process.env.PARTY_CONFIG = JSON.stringify({
      birthday: { name: 'TestUser', age: 1, flavorText: 'Sabor.' },
      party: { date: '2000-01-01', time: '10:00', venue: 'TestVenue', address: 'Calle 1', mapsEmbedUrl: 'https://test.com' },
      card: { artImageUrl: '/test.jpg', setSymbol: '⭐' },
    })
    const config = getPartyConfig()
    expect(config.birthday.name).toBe('TestUser')
    expect(config.party.venue).toBe('TestVenue')
  })

  it('falls back to party.json when PARTY_CONFIG is not set', () => {
    delete process.env.PARTY_CONFIG
    const config = getPartyConfig()
    expect(config.birthday.name).toBeTruthy()
    expect(config.party.venue).toBeTruthy()
    expect(config.card.setSymbol).toBeTruthy()
  })
})
