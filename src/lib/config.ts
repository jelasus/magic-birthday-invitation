import partyJson from '../../config/party.json'

export type PartyConfig = typeof partyJson

export function getPartyConfig(): PartyConfig {
  if (process.env.PARTY_CONFIG) {
    try {
      const parsed = JSON.parse(process.env.PARTY_CONFIG)
      if (typeof parsed?.birthday?.name === 'string') {
        return parsed as PartyConfig
      }
    } catch {
      // malformed JSON — fall through to default
    }
  }
  return partyJson
}
