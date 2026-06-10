import type { Metadata } from 'next'
import { Cinzel, IM_Fell_English } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const imFell = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-im-fell',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Invitación Mágica de Cumpleaños',
  description: 'Una celebración al estilo Magic: The Gathering',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${imFell.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
