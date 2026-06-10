import type { Guild } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

interface MtgCardProps {
  guild: Guild
  config: PartyConfig
  guestName?: string
}

export function MtgCard({ guild, config, guestName }: MtgCardProps) {
  const { birthday, party, card } = config

  return (
    <div
      className="relative w-[340px] rounded-2xl p-3 flex flex-col gap-2 select-none"
      style={{
        background: guild.frameGradient,
        border: `4px solid ${guild.borderColor}`,
        boxShadow: `0 0 30px ${guild.manaColors[0]}55, 0 12px 40px rgba(0,0,0,0.7)`,
      }}
    >
      {/* Name bar */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-1.5 gap-2"
        style={{ backgroundColor: guild.nameBarColor }}
      >
        <span className="font-bold text-xs text-gray-900 leading-tight">
          Celebración del {birthday.age}° Cumpleaños de {birthday.name}
        </span>
        <div className="flex gap-1 shrink-0">
          {guild.manaColors.map((color, i) => (
            <ManaSymbol key={guild.colors[i]} color={color} letter={guild.colors[i].toUpperCase()} />
          ))}
        </div>
      </div>

      {/* Art box */}
      <div
        className="w-full h-44 rounded-lg overflow-hidden border-2"
        style={{
          borderColor: guild.borderColor,
          backgroundImage: `url(${card.artImageUrl}), ${guild.frameGradient}`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Type line */}
      <div
        className="flex items-center justify-between rounded-lg px-3 py-1 text-xs"
        style={{ backgroundColor: guild.nameBarColor }}
      >
        <span className="font-semibold text-gray-900">
          Conjuro Legendario — Celebración
        </span>
        <span className="text-base">{card.setSymbol}</span>
      </div>

      {/* Text box */}
      <div
        className="rounded-lg p-3 space-y-1.5 text-xs"
        style={{ backgroundColor: guild.textBoxColor + 'F0' }}
      >
        <p className="font-semibold text-gray-800">📅 {party.date}</p>
        <p className="font-semibold text-gray-800">⏰ {party.time}</p>
        <p className="font-semibold text-gray-800">📍 {party.venue}</p>
        <p className="text-gray-600 text-[11px]">{party.address}</p>
        {guestName && (
          <p className="mt-2 font-bold text-amber-800">✨ Invitado especial: {guestName}</p>
        )}
        <p className="mt-2 italic text-gray-500 border-t border-gray-400 pt-2 text-[11px]">
          &quot;{birthday.flavorText}&quot;
        </p>
      </div>

      {/* Power/toughness */}
      <div
        className="absolute bottom-5 right-5 px-2 py-0.5 rounded text-xs font-black border-2"
        style={{
          backgroundColor: guild.nameBarColor,
          borderColor: guild.borderColor,
          color: '#1a1a1a',
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
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-gray-500 shadow-sm"
      style={{
        backgroundColor: color,
        color: letter === 'B' ? '#d0d0d0' : '#1a1a1a',
      }}
    >
      {letter}
    </div>
  )
}
