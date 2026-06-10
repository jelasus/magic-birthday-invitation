import { GUILDS } from '@/lib/colors'
import { getPartyConfig } from '@/lib/config'
import { MtgCard } from '@/components/MtgCard'

export default function GalleryPage() {
  const config = getPartyConfig()

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a0d 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-amber-400 text-center mb-1 tracking-wide font-[family-name:var(--font-cinzel)]">
          Invitación Mágica de Cumpleaños
        </h1>
        <p className="text-amber-200 text-center mb-1 text-sm italic font-[family-name:var(--font-im-fell)]">
          Celebración del {config.birthday.age}° Cumpleaños de {config.birthday.name}
        </p>
        <p className="text-gray-500 text-center mb-10 text-xs italic font-[family-name:var(--font-im-fell)]">
          Cada invitado recibe un enlace personalizado con su combinación de colores
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {Object.values(GUILDS).map(guild => (
            <div key={guild.code} className="flex flex-col items-center gap-2">
              <MtgCard guild={guild} config={config} />
              <p className="text-amber-300 text-xs font-bold">
                {guild.name} ({guild.code.toUpperCase()})
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-900 border border-amber-900 rounded-xl p-6 max-w-lg mx-auto">
          <h2 className="text-amber-400 font-bold text-lg mb-3">
            📨 Generar enlace de invitación
          </h2>
          <p className="text-gray-300 text-sm mb-3">
            Comparte un enlace personalizado con cada invitado:
          </p>
          <code className="block bg-gray-800 rounded-lg p-3 text-amber-300 text-xs break-all">
            /invite?guest=NombreInvitado&amp;colors=ub
          </code>
          <p className="text-gray-500 text-xs mt-2">
            Cambia{' '}
            <span className="text-amber-400">NombreInvitado</span> por el nombre del
            invitado y{' '}
            <span className="text-amber-400">ub</span> por el código de colores de la
            tabla de arriba.
          </p>
        </div>
      </div>
    </main>
  )
}
