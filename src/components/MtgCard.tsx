import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

/** Relative luminance of a #rrggbb colour (0 = black, 1 = white). */
function hexLuminance(hex: string): number {
  const c = hex.replace('#', '')
  if (c.length !== 6) return 0
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Pick dark ink or light parchment text so it stays legible on any background. */
function readableOn(hex: string): string {
  return hexLuminance(hex) > 0.55 ? '#15110a' : '#f4ecd8'
}

const BEVEL =
  'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 1px rgba(0,0,0,0.25)'

export function MtgCard({ guild, config, guestName }: MtgCardProps) {
  const { birthday, party, card } = config
  const barInk = readableOn(guild.nameBarColor)

  return (
    <div
      className="relative w-[330px] rounded-[18px] p-[9px] select-none"
      style={{
        background: 'linear-gradient(155deg, #2c2c2c 0%, #0a0a0a 60%, #000 100%)',
        boxShadow: `0 0 26px ${guild.manaColors[0]}40, 0 14px 38px rgba(0,0,0,0.75)`,
      }}
    >
      {/* Coloured frame */}
      <div
        className="flex flex-col gap-2 rounded-[10px] p-2.5"
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
            className="font-[family-name:var(--font-cinzel)] text-[12.5px] font-semibold leading-tight"
            style={{ color: barInk }}
          >
            Celebración del {birthday.age}° Cumpleaños de {birthday.name}
          </span>
          <div className="flex shrink-0 gap-1">
            {guild.manaColors.map((color, i) => (
              <ManaSymbol key={guild.colors[i]} color={color} letter={guild.colors[i].toUpperCase()} />
            ))}
          </div>
        </div>

        {/* Art box */}
        <div className="rounded-md p-[3px]" style={{ background: 'linear-gradient(180deg,#1c1c1c,#000)' }}>
          <div
            className="h-44 w-full rounded-[3px]"
            style={{
              backgroundImage: `url(${card.artImageUrl}), ${guild.frameGradient}`,
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
          className="rounded-md px-3 py-2.5 font-[family-name:var(--font-eb-garamond)]"
          style={{
            background: 'linear-gradient(180deg,#f7f0de 0%,#ece0c4 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), inset 0 1px 4px rgba(0,0,0,0.12)',
            color: '#1c160c',
          }}
        >
          <div className="space-y-0.5 text-[14px] leading-snug">
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
            <p className="pl-5 text-[12.5px] text-[#574a33]">{party.address}</p>
          </div>

          {guestName && (
            <p className="mt-2 text-[13.5px] font-semibold" style={{ color: '#6b4a12' }}>
              ✨ Invitado especial: {guestName}
            </p>
          )}

          <div
            className="my-2 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.28),transparent)' }}
          />

          <p className="text-[13px] italic leading-snug text-[#3a3326]">
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

function ManaSymbol({ color, letter }: { color: string; letter: string }) {
  return (
    <div
      className="flex h-[19px] w-[19px] items-center justify-center rounded-full text-[10px] font-bold"
      style={{
        background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.65), transparent 50%), ${color}`,
        color: readableOn(color),
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      {letter}
    </div>
  )
}
