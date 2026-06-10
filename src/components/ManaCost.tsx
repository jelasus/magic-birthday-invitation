import type { CostToken } from '@/lib/cards'
import { ManaSymbol } from '@/components/ManaSymbol'

function GenericPip({ value, size = 19 }: { value: number; size?: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} maná genérico`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '9999px',
        background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.8), transparent 55%), #cdc6bb',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)',
        color: '#1a1a1a',
        fontWeight: 700,
        fontSize: size * 0.58,
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  )
}

/** Renders a mana cost (generic numbers + colored pips) left to right. */
export function ManaCost({ cost, size = 19 }: { cost: CostToken[]; size?: number }) {
  return (
    <span className="inline-flex gap-1">
      {cost.map((token, i) =>
        typeof token === 'number' ? (
          <GenericPip key={i} value={token} size={size} />
        ) : (
          <ManaSymbol key={i} code={token} size={size} />
        )
      )}
    </span>
  )
}
