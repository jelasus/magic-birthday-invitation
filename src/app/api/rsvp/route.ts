import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let body: { guest_name?: unknown; attending?: unknown; message?: unknown; colors?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Formato de solicitud inválido.' },
      { status: 400 }
    )
  }

  const { guest_name, attending, message, colors } = body

  if (!guest_name || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('rsvps').insert({
    guest_name: String(guest_name).trim().slice(0, 200),
    attending: Boolean(attending),
    message: message ? String(message).trim().slice(0, 2000) : null,
    colors: colors ? String(colors).slice(0, 10) : null,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Ocurrió un error. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
