import type { ReactNode } from 'react'
import type { ColorCode } from '@/lib/colors'
import { manaInfo } from '@/lib/mana'
import { readableOn } from '@/lib/contrast'

interface ManaSymbolProps {
  code: ColorCode
  size?: number
}

/** Simplified but recognizable vector glyphs, drawn in a 24×24 viewBox. */
const GLYPHS: Record<ColorCode, ReactNode> = {
  // Sun
  w: (
    <g>
      <circle cx="12" cy="12" r="4.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <rect
          key={a}
          x="11.2"
          y="1.6"
          width="1.6"
          height="3.6"
          rx="0.8"
          transform={`rotate(${a} 12 12)`}
        />
      ))}
    </g>
  ),
  // Water droplet
  u: <path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" />,
  // Skull
  b: (
    <g>
      <path d="M12 3 C7 3 4 6.5 4 11 c0 2.4 1.2 3.9 2.6 4.8 V18 a1 1 0 0 0 1 1 h8.8 a1 1 0 0 0 1-1 v-2.2 C18.8 14.9 20 13.4 20 11 C20 6.5 17 3 12 3 Z" />
      <circle cx="9" cy="11" r="1.7" fill="#fff" />
      <circle cx="15" cy="11" r="1.7" fill="#fff" />
      <path d="M11 15 l1-2 1 2 z" fill="#fff" />
    </g>
  ),
  // Flame
  r: <path d="M12 2 C13.5 6 17.5 7.5 16 13 a4.2 4.2 0 0 1-8.2 0 C6.8 9.6 9.5 7.5 10 4.5 C10.7 6 11.6 6.5 12 7.5 C12.4 6 12.3 4 12 2 Z" />,
  // Pine tree
  g: (
    <g>
      <path d="M12 2 L16 9 H8 Z" />
      <path d="M12 7 L17 15 H7 Z" />
      <rect x="10.6" y="15" width="2.8" height="5" rx="0.6" />
    </g>
  ),
}

export function ManaSymbol({ code, size = 19 }: ManaSymbolProps) {
  const { label, pipColor } = manaInfo(code)
  const ink = readableOn(pipColor)
  return (
    <span
      role="img"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '9999px',
        background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.75), transparent 55%), ${pipColor}`,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      <svg
        width={size * 0.66}
        height={size * 0.66}
        viewBox="0 0 24 24"
        fill={ink}
        aria-hidden="true"
      >
        {GLYPHS[code]}
      </svg>
    </span>
  )
}
