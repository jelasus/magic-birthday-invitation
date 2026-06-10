import type { ColorCode } from '@/lib/colors'
import { readableOn } from '@/lib/contrast'

export interface FrameStyle {
  frameGradient: string
  barColor: string
  barInk: string
}

const MONO: Record<ColorCode, { frameGradient: string; barColor: string }> = {
  w: { frameGradient: 'linear-gradient(160deg,#f7f2dd 0%,#e9e0c2 55%,#cdbf95 100%)', barColor: '#efe7cf' },
  u: { frameGradient: 'linear-gradient(160deg,#bfe0f2 0%,#5aa0d6 55%,#246397 100%)', barColor: '#bcd9ef' },
  b: { frameGradient: 'linear-gradient(160deg,#3a3a3e 0%,#1d1d20 55%,#0b0b0d 100%)', barColor: '#26262a' },
  r: { frameGradient: 'linear-gradient(160deg,#f0a98f 0%,#d4502f 55%,#9c2415 100%)', barColor: '#e3a08a' },
  g: { frameGradient: 'linear-gradient(160deg,#bcd9a6 0%,#5f9c4f 55%,#2f6b2c 100%)', barColor: '#bcd2a6' },
}

const GOLD = { frameGradient: 'linear-gradient(160deg,#f3e2a3 0%,#caa84e 55%,#8a6a23 100%)', barColor: '#e6cf8f' }
const ARTIFACT = { frameGradient: 'linear-gradient(160deg,#d8dde2 0%,#aab2bb 55%,#6f7780 100%)', barColor: '#c7ccd2' }

/** Frame style from a card's color identity: 0 = artifact, 1 = mono, 2+ = gold. */
export function frameFor(colors: ColorCode[]): FrameStyle {
  const base = colors.length === 0 ? ARTIFACT : colors.length >= 2 ? GOLD : MONO[colors[0]]
  return { frameGradient: base.frameGradient, barColor: base.barColor, barInk: readableOn(base.barColor) }
}
