import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { guest_name?: unknown; attending?: unknown; colors?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Formato de solicitud inválido.' },
      { status: 400 }
    )
  }

  const { guest_name, attending, colors } = body

  if (!guest_name || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos.' },
      { status: 400 }
    )
  }

  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'El servicio no está disponible en este momento.' },
      { status: 503 }
    )
  }

  const { error } = await supabase.from('rsvps').insert({
    guest_name: String(guest_name).trim().slice(0, 200),
    attending: Boolean(attending),
    colors: colors ? String(colors).slice(0, 10) : null,
  })

  if (error) {
    // Surface the real Postgres/Supabase error — both in the server logs and in
    // the response — so the underlying cause (RLS policy, missing table/column,
    // bad key) is visible to whoever is submitting/debugging the RSVP.
    console.error('RSVP insert failed:', error)
    return NextResponse.json(
      { error: `No se pudo guardar la respuesta: ${error.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
