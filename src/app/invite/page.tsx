import { getGuild, randomGuildCode } from '@/lib/colors'
import { getPartyConfig } from '@/lib/config'
import { MtgCard } from '@/components/MtgCard'
import { MapEmbed } from '@/components/MapEmbed'
import { RsvpForm } from '@/components/RsvpForm'

export const dynamic = 'force-dynamic'

interface InvitePageProps {
  searchParams: Promise<{ guest?: string; colors?: string }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams
  const guestName = params.guest || ''
  const guildCode = params.colors || randomGuildCode()
  const guild = getGuild(guildCode)
  const config = getPartyConfig()

  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <h1 className="text-4xl font-black text-amber-400 mb-1 text-center tracking-wide drop-shadow-lg font-[family-name:var(--font-cinzel)]">
        ¡Estás invitado!
      </h1>
      <p className="text-amber-200 mb-8 text-sm text-center italic font-[family-name:var(--font-im-fell)]">
        Una aventura mágica te espera
      </p>

      <MtgCard guild={guild} config={config} guestName={guestName} />

      <div className="mt-10 w-full max-w-sm">
        <h2 className="text-amber-400 font-bold text-lg mb-3 font-[family-name:var(--font-cinzel)]">
          📍 Cómo llegar
        </h2>
        <MapEmbed url={config.party.mapsEmbedUrl} />
      </div>

      <div className="mt-10 w-full max-w-sm mb-16">
        <h2 className="text-amber-400 font-bold text-lg mb-3 font-[family-name:var(--font-cinzel)]">
          ✅ Confirmar asistencia
        </h2>
        <RsvpForm guestName={guestName} guildCode={guildCode} />
      </div>
    </main>
  )
}
