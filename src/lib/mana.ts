import type { ColorCode } from '@/lib/colors'

export interface ManaInfo {
  code: ColorCode
  /** Spanish accessibility label, e.g. "maná azul". */
  label: string
  /** Canonical Magic pip background colour. */
  pipColor: string
}

export const MANA: Record<ColorCode, ManaInfo> = {
  w: { code: 'w', label: 'maná blanco', pipColor: '#FBF7E6' },
  u: { code: 'u', label: 'maná azul', pipColor: '#AAE0FA' },
  b: { code: 'b', label: 'maná negro', pipColor: '#CCC2C0' },
  r: { code: 'r', label: 'maná rojo', pipColor: '#F9AA8F' },
  g: { code: 'g', label: 'maná verde', pipColor: '#9BD3AE' },
}

export function manaInfo(code: ColorCode): ManaInfo {
  return MANA[code]
}
