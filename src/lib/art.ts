/** Birthday art cropped from the example cards. Add/remove files freely. */
export const ART_POOL: string[] = [
  '/images/art/art1.jpg',
  '/images/art/art2.jpg',
  '/images/art/art3.jpg',
  '/images/art/art4.jpg',
  '/images/art/art5.jpg',
]

/** Stable non-negative hash of a string. */
function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Pick an art path. With a non-empty seed (e.g. the guest's name) the choice is
 * deterministic, so the same link always shows the same card. Without a seed it
 * is random. ART_POOL is a non-empty constant, so no empty-pool branch is needed.
 */
export function pickArt(seed?: string | null): string {
  if (seed) {
    return ART_POOL[hashSeed(seed) % ART_POOL.length]
  }
  return ART_POOL[Math.floor(Math.random() * ART_POOL.length)]
}
