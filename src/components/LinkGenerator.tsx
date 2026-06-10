'use client'

import { useState } from 'react'
import { pickCard } from '@/lib/cards'

interface GeneratedLink {
  id: number
  name: string
  cardTitle: string
  url: string
}

export function LinkGenerator() {
  const [name, setName] = useState('')
  const [links, setLinks] = useState<GeneratedLink[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  function generate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const card = pickCard(trimmed)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/invite?guest=${encodeURIComponent(trimmed)}`

    setLinks(prev => [
      { id: Date.now(), name: trimmed, cardTitle: card.title, url },
      ...prev,
    ])
    setName('')
  }

  async function copy(link: GeneratedLink) {
    try {
      await navigator.clipboard.writeText(link.url)
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(current => (current === link.id ? null : current)), 1800)
    } catch {
      // clipboard unavailable — the field is selectable as a fallback
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-amber-900/60 bg-gray-900/80 p-6">
      <h2 className="mb-1 font-[family-name:var(--font-cinzel)] text-lg font-bold text-amber-400">
        🔗 Generar enlaces de invitación
      </h2>
      <p className="mb-4 text-sm text-gray-400">
        Escribe el nombre del invitado y genera un enlace único. La carta se asigna automáticamente
        según el nombre.
      </p>

      <form onSubmit={generate} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          placeholder="Nombre del invitado"
          className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500"
        >
          🎲 Generar
        </button>
      </form>

      {links.length === 0 ? (
        <p className="mt-6 text-center text-xs text-gray-600">
          Los enlaces generados aparecerán aquí.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {links.map(link => (
            <li key={link.id} className="rounded-lg border border-gray-700 bg-gray-800/70 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{link.name}</span>
                <span className="text-xs text-amber-300">{link.cardTitle}</span>
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={link.url}
                  onFocus={e => e.target.select()}
                  className="flex-1 truncate rounded border border-gray-600 bg-gray-900 px-2 py-1.5 text-xs text-gray-300"
                />
                <button
                  onClick={() => copy(link)}
                  className="shrink-0 rounded border border-amber-700 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-700 hover:text-white"
                >
                  {copiedId === link.id ? '✓ Copiado' : 'Copiar'}
                </button>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded border border-gray-600 px-3 py-1.5 text-xs font-bold text-gray-300 transition-colors hover:border-amber-400 hover:text-amber-300"
                >
                  Abrir
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
