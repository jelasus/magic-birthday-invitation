import type { PartyConfig } from '@/lib/config'
import type { CardIdentity } from '@/lib/cards'
import { ManaCost } from '@/components/ManaCost'
import { frameFor } from '@/lib/frames'

interface CardFrontProps {
  card: CardIdentity
  config: PartyConfig
  guestName?: string
}

const BEVEL =
  'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.25)'

const PARCHMENT_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"

export function CardFront({ card, config, guestName }: CardFrontProps) {
  const { birthday, party, card: cardCfg } = config
  const frame = frameFor(card.colors)

  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[14px] p-[7px] select-none"
      style={{ background: 'linear-gradient(155deg, #2c2c2c 0%, #0a0a0a 60%, #000 100%)' }}
    >
      <div
        className="flex flex-1 flex-col gap-1.5 rounded-[9px] p-2"
        style={{
          background: frame.frameGradient,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.25)',
        }}
      >
        {/* Name bar: English title + mana cost */}
        <div
          className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5"
          style={{ background: frame.barColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[12px] font-semibold leading-tight"
            style={{ color: frame.barInk }}
          >
            {card.title}
          </span>
          <ManaCost cost={card.cost} />
        </div>

        {/* Art */}
        <div className="rounded-md p-[3px]" style={{ background: 'linear-gradient(180deg,#1c1c1c,#000)' }}>
          <div
            data-testid="card-art"
            className="h-40 w-full rounded-[3px]"
            style={{
              backgroundImage: `url(${card.art}), ${frame.frameGradient}`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 3px 14px rgba(0,0,0,0.45)',
            }}
          />
        </div>

        {/* Type line: English type + set symbol */}
        <div
          className="flex items-center justify-between rounded-md px-2.5 py-1"
          style={{ background: frame.barColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[10.5px] font-medium tracking-wide"
            style={{ color: frame.barInk }}
          >
            {card.typeLine}
          </span>
          <span className="text-sm leading-none">{cardCfg.setSymbol}</span>
        </div>

        {/* Text box: Spanish party details + English flavor */}
        <div
          className="flex-1 rounded-md px-3 py-2 font-[family-name:var(--font-eb-garamond)]"
          style={{
            backgroundColor: '#f1e7cd',
            backgroundImage: `${PARCHMENT_NOISE}, linear-gradient(180deg,#f7f0de 0%,#ece0c4 100%)`,
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 4px rgba(0,0,0,0.12)',
            color: '#1c160c',
          }}
        >
          <div className="space-y-0.5 text-[13.5px] leading-snug">
            <p className="font-semibold">
              🎂 {birthday.age}° Cumpleaños de {birthday.name}
            </p>
            <p>
              <span className="opacity-60">📅</span> {party.date}
            </p>
            <p>
              <span className="opacity-60">⏰</span> {party.time} · <span className="opacity-60">📍</span> {party.venue}
            </p>
            <p className="pl-5 text-[12px] text-[#574a33]">{party.address}</p>
          </div>

          {guestName && (
            <p className="mt-1.5 text-[13px] font-semibold" style={{ color: '#6b4a12' }}>
              ✨ Invitado especial: {guestName}
            </p>
          )}

          <div
            className="my-1.5 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.28),transparent)' }}
          />

          <p className="text-[12.5px] italic leading-snug text-[#3a3326]">&ldquo;{card.flavor}&rdquo;</p>
        </div>

        {/* Collector line */}
        <div
          className="flex items-center justify-between rounded px-2 py-0.5 text-[8.5px] tracking-wide"
          style={{ background: 'rgba(0,0,0,0.28)', color: '#f4ecd8' }}
        >
          <span>Ilustración • {birthday.name}</span>
          <span className="uppercase">{card.id.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
