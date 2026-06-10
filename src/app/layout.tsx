import type { Metadata } from 'next'
import { Cinzel, EB_Garamond } from 'next/font/google'
import './globals.css'

// Cinzel — epic Roman titling caps, used for card names, type lines and headings
// (the closest freely-hostable stand-in for Magic's proprietary "Beleren").
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

// EB Garamond — a humanist serif very close to MTG's "Plantin" rules/flavor text,
// with a proper italic for flavor lines.
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Invitación Mágica de Cumpleaños',
  description: 'Una celebración al estilo Magic: The Gathering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${ebGaramond.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
