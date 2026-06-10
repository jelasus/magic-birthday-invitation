import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'
import { ManaSymbol } from '@/components/ManaSymbol'
import { readableOn } from '@/lib/contrast'

interface CardFrontProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
  artUrl?: string
}

const BEVEL =
  'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.25)'

// Faint parchment grain, encoded so it needs no binary asset.
const PARCHMENT_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"

export function CardFront({ guild, config, guestName, artUrl }: CardFrontProps) {
  const { birthday, party, card } = config
  const art = artUrl ?? card.artImageUrl
  const barInk = readableOn(guild.nameBarColor)

  return (
    <div
      className="absolute inset-0 flex flex-col rounded-[14px] p-[7px] select-none"
      style={{ background: 'linear-gradient(155deg, #2c2c2c 0%, #0a0a0a 60%, #000 100%)' }}
    >
      {/* Coloured frame */}
      <div
        className="flex flex-1 flex-col gap-1.5 rounded-[9px] p-2"
        style={{
          background: guild.frameGradient,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 3px rgba(255,255,255,0.25)',
        }}
      >
        {/* Name bar */}
        <div
          className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5"
          style={{ background: guild.nameBarColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[12px] font-semibold leading-tight"
            style={{ color: barInk }}
          >
            Celebración del {birthday.age}° Cumpleaños de {birthday.name}
          </span>
          <div className="flex shrink-0 gap-1">
            {guild.colors.map(code => (
              <ManaSymbol key={code} code={code} />
            ))}
          </div>
        </div>

        {/* Art box */}
        <div
          className="rounded-md p-[3px]"
          style={{ background: 'linear-gradient(180deg,#1c1c1c,#000)' }}
        >
          <div
            data-testid="card-art"
            className="w-full rounded-[3px]"
            style={{
              aspectRatio: '4 / 3',
              backgroundImage: `url(${art}), ${guild.frameGradient}`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.6), inset 0 3px 14px rgba(0,0,0,0.45)',
            }}
          />
        </div>

        {/* Type line */}
        <div
          className="flex items-center justify-between rounded-md px-2.5 py-1"
          style={{ background: guild.nameBarColor, boxShadow: BEVEL }}
        >
          <span
            className="font-[family-name:var(--font-cinzel)] text-[10.5px] font-medium tracking-wide"
            style={{ color: barInk }}
          >
            Conjuro Legendario — Celebración
          </span>
          <span className="text-sm leading-none">{card.setSymbol}</span>
        </div>

        {/* Text box (parchment) */}
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
            <p>
              <span className="opacity-60">📅</span>{' '}
              <strong className="font-semibold">{party.date}</strong>
            </p>
            <p>
              <span className="opacity-60">⏰</span> {party.time}
            </p>
            <p>
              <span className="opacity-60">📍</span> {party.venue}
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

          <p className="text-[12.5px] italic leading-snug text-[#3a3326]">
            &ldquo;{birthday.flavorText}&rdquo;
          </p>
        </div>

        {/* Collector / artist line */}
        <div
          className="flex items-center justify-between rounded px-2 py-0.5 text-[8.5px] tracking-wide"
          style={{ background: 'rgba(0,0,0,0.28)', color: '#f4ecd8' }}
        >
          <span>Ilustración • {birthday.name}</span>
          <span className="uppercase">
            {guild.name} · {guild.code.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Power / toughness */}
      <div
        className="absolute bottom-2 right-2 rounded-[5px] border px-2 py-0.5 font-[family-name:var(--font-cinzel)] text-[13px] font-bold"
        style={{
          background: guild.nameBarColor,
          borderColor: 'rgba(0,0,0,0.55)',
          color: barInk,
          boxShadow: '0 2px 6px rgba(0,0,0,0.55), ' + BEVEL,
        }}
      >
        {birthday.age}/∞
      </div>
    </div>
  )
}
