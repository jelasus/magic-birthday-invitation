import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { guest_name, attending, message, colors } = body

  if (!guest_name || attending === undefined || attending === null) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('rsvps').insert({
    guest_name: String(guest_name).trim(),
    attending: Boolean(attending),
    message: message ? String(message).trim() : null,
    colors: colors ? String(colors) : null,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Ocurrió un error. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
