'use client'

import { useState } from 'react'

interface RsvpFormProps {
  guestName: string
  guildCode: string
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function RsvpForm({ guestName, guildCode }: RsvpFormProps) {
  const [name, setName] = useState(guestName)
  const [attending, setAttending] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (attending === null) return
    setState('loading')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: name, attending, message, colors: guildCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Ocurrió un error. Por favor intenta de nuevo.')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg('Ocurrió un error. Por favor intenta de nuevo.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-green-950 border border-green-600 rounded-xl p-6 text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="text-green-300 font-bold text-lg">¡Tu respuesta ha sido registrada!</p>
        <p className="text-green-400 text-sm mt-1">Nos vemos en la fiesta</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-amber-300 text-sm font-medium mb-1">
          Tu nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
          placeholder="Tu nombre completo"
        />
      </div>

      <div>
        <p className="text-amber-300 text-sm font-medium mb-2">¿Asistirás?</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAttending(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
              attending === true
                ? 'bg-green-800 border-green-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-green-600'
            }`}
          >
            ✅ Sí, asistiré
          </button>
          <button
            type="button"
            onClick={() => setAttending(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
              attending === false
                ? 'bg-red-950 border-red-600 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-red-700'
            }`}
          >
            ❌ No podré
          </button>
        </div>
      </div>

      <div>
        <label className="block text-amber-300 text-sm font-medium mb-1">
          Mensaje para el festejado{' '}
          <span className="text-gray-500">(opcional)</span>
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
          placeholder="Escribe un mensaje..."
        />
      </div>

      {state === 'error' && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || attending === null}
        className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors"
      >
        {state === 'loading' ? 'Enviando...' : 'Confirmar asistencia'}
      </button>
    </form>
  )
}
