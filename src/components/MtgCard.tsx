'use client'

import { useState } from 'react'
import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'
import { CardFront } from '@/components/CardFront'
import { CardBack } from '@/components/CardBack'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

export function MtgCard({ guild, config, guestName }: MtgCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={flipped ? 'Mostrar el frente de la carta' : 'Voltear la carta'}
        aria-pressed={flipped}
        onClick={() => setFlipped(f => !f)}
        className={`card-flip block w-[330px] cursor-pointer rounded-[16px] p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
          flipped ? 'card-flip--flipped' : ''
        }`}
        style={{
          aspectRatio: '2.5 / 3.5',
          background: 'transparent',
          border: 'none',
          boxShadow: `0 0 26px ${guild.manaColors[0]}40, 0 14px 38px rgba(0,0,0,0.75)`,
        }}
      >
        <div className="card-flip__inner">
          <div className="card-flip__face card-flip__face--front">
            <CardFront guild={guild} config={config} guestName={guestName} />
          </div>
          <div className="card-flip__face card-flip__face--back">
            <CardBack />
          </div>
        </div>
      </button>
      <span className="text-[11px] italic text-amber-200/70 font-[family-name:var(--font-eb-garamond)]">
        toca para ver el reverso ↻
      </span>
    </div>
  )
}
