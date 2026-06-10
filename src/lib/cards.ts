import type { ColorCode } from '@/lib/colors'

/** A mana-cost token: a number = generic mana, a ColorCode = a colored pip. */
export type CostToken = number | ColorCode

export interface CardIdentity {
  id: string
  art: string
  title: string
  typeLine: string
  cost: CostToken[]
  colors: ColorCode[]
  flavor: string
}

export const CARD_POOL: CardIdentity[] = [
  { id: 'cake', art: '/images/art/art1.jpg', title: 'Birthday Cake', typeLine: 'Artifact — Cake', cost: [2], colors: [], flavor: 'Even the Multiverse stops for cake.' },
  { id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery', cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.' },
  { id: 'make-a-wish', art: '/images/art/art3.jpg', title: 'Happy Birthday!', typeLine: 'Sorcery', cost: [1, 'g'], colors: ['g'], flavor: 'Make your wish before the candles win.' },
  { id: 'party', art: '/images/art/art4.jpg', title: 'Birthday Party', typeLine: 'Sorcery', cost: [4, 'b', 'b'], colors: ['b'], flavor: 'A spell you may cast but once a year.' },
  { id: 'lets-party', art: '/images/art/art5.jpg', title: "Let's Party", typeLine: 'Enchantment', cost: ['w', 'u', 'b', 'r', 'g'], colors: ['w', 'u', 'b', 'r', 'g'], flavor: 'Whenever a guest celebrates, the party was a success.' },
]

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

/** Deterministic card from a seed (guest name); random when no seed. */
export function pickCard(seed?: string | null): CardIdentity {
  if (seed) return CARD_POOL[hashSeed(seed) % CARD_POOL.length]
  return CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
}
