import partyJson from '../../config/party.json'

export type PartyConfig = typeof partyJson

export function getPartyConfig(): PartyConfig {
  if (process.env.PARTY_CONFIG) {
    return JSON.parse(process.env.PARTY_CONFIG) as PartyConfig
  }
  return partyJson
}
