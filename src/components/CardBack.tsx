import type { ColorCode } from '@/lib/colors'
import { ManaSymbol } from '@/components/ManaSymbol'

const WHEEL: ColorCode[] = ['w', 'u', 'b', 'r', 'g']

/** Authentic Magic: The Gathering card back (tome, oval, logo, color wheel, Deckmaster). */
export function CardBack() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[14px] font-[family-name:var(--font-cinzel)]"
      style={{
        background: 'linear-gradient(160deg,#5b3415 0%,#3a1f0c 55%,#27150a 100%)',
        boxShadow: 'inset 0 0 0 6px #1c0f06, inset 0 0 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Ornate inner border */}
      <div
        className="absolute inset-[10px] rounded-[9px]"
        style={{
          border: '2px solid #c79a4b',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5), 0 0 12px rgba(199,154,75,0.25)',
        }}
      />
      {/* Four red rivets */}
      {[
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            ...pos,
            background: 'radial-gradient(circle at 35% 30%, #ff6a4d, #8b1a0a 70%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.7)',
          }}
        />
      ))}

      {/* Central oval */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex h-[78%] w-[74%] flex-col items-center justify-between rounded-[50%] px-6 py-10 text-center"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, #7a4a22 0%, #5d3417 60%, #43250f 100%)',
            boxShadow:
              'inset 0 0 0 2px rgba(0,0,0,0.45), inset 0 0 26px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.4)',
          }}
        >
          {/* Logo */}
          <div className="mt-2">
            <p
              className="text-[19px] font-bold italic leading-tight tracking-wide"
              style={{ color: '#6fa9e0', textShadow: '0 2px 3px rgba(0,0,0,0.85)' }}
            >
              Magic: The Gathering
            </p>
          </div>

          {/* Color wheel */}
          <div className="flex gap-1.5">
            {WHEEL.map(code => (
              <ManaSymbol key={code} code={code} size={20} />
            ))}
          </div>

          {/* Deckmaster */}
          <p
            className="mb-2 text-[12px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: '#e7d3a6', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            Deckmaster
          </p>
        </div>
      </div>
    </div>
  )
}
