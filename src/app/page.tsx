import { CARD_POOL } from '@/lib/cards'
import { getPartyConfig } from '@/lib/config'

import { MtgCard } from '@/components/MtgCard'
import { LinkGenerator } from '@/components/LinkGenerator'

export const dynamic = 'force-dynamic'

interface GalleryPageProps {
  searchParams: Promise<{ key?: string }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { key } = await searchParams
  const adminKey = process.env.ADMIN_KEY
  const locked = Boolean(adminKey) && key !== adminKey

  if (locked) {
    return <LockScreen wrong={key !== undefined} />
  }

  const config = getPartyConfig()

  return (
    <main
      className="min-h-screen px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-center font-[family-name:var(--font-cinzel)] text-4xl font-bold tracking-wide text-amber-400">
          Panel del Anfitrión
        </h1>
        <p className="mb-1 text-center font-[family-name:var(--font-eb-garamond)] text-sm italic text-amber-200">
          Celebración del {config.birthday.age}° Cumpleaños de {config.birthday.name}
        </p>
        <p className="mb-10 text-center font-[family-name:var(--font-eb-garamond)] text-xs italic text-gray-500">
          Genera enlaces únicos para cada invitado y compártelos.
        </p>

        {!adminKey && (
          <div className="mx-auto mb-8 max-w-xl rounded-lg border border-yellow-700/60 bg-yellow-950/40 p-3 text-center text-xs text-yellow-300">
            ⚠️ Esta página es pública. Configura la variable de entorno{' '}
            <code className="text-yellow-200">ADMIN_KEY</code> en Vercel para protegerla.
          </div>
        )}

        <LinkGenerator />

        <h2 className="mb-1 mt-16 text-center font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-amber-400">
          Estilos de carta
        </h2>
        <p className="mb-8 text-center font-[family-name:var(--font-eb-garamond)] text-xs italic text-gray-500">
          Vista previa de las cartas que se asignan al azar a cada invitado.
        </p>

        <div className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARD_POOL.map(card => (
            <div key={card.id} className="flex flex-col items-center gap-2">
              <MtgCard card={card} config={config} />
              <p className="text-xs font-bold text-amber-300">{card.title}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function LockScreen({ wrong }: { wrong: boolean }) {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <form
        method="get"
        action="/"
        className="w-full max-w-sm rounded-xl border border-amber-900/60 bg-gray-900/80 p-6 text-center"
      >
        <h1 className="mb-2 font-[family-name:var(--font-cinzel)] text-2xl font-bold text-amber-400">
          🔒 Área privada
        </h1>
        <p className="mb-4 text-sm text-gray-400">
          Introduce la clave de anfitrión para generar enlaces.
        </p>
        <input
          type="password"
          name="key"
          autoFocus
          placeholder="Clave de acceso"
          className="mb-3 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
        />
        {wrong && <p className="mb-3 text-xs text-red-400">Clave incorrecta.</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-700 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600"
        >
          Entrar
        </button>
      </form>
    </main>
  )
}
