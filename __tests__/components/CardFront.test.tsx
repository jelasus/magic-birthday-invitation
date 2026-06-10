import { render, screen } from '@testing-library/react'
import { CardFront } from '@/components/CardFront'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const config: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('CardFront', () => {
  it('renders name, type line, details, flavor and P/T', () => {
    render(<CardFront guild={GUILDS.ub} config={config} />)
    expect(screen.getAllByText(/Brayan/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Conjuro Legendario/)).toBeInTheDocument()
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Texto de ambientación/)).toBeInTheDocument()
    expect(screen.getByText('28/∞')).toBeInTheDocument()
  })

  it('renders the guild mana pips as vector symbols', () => {
    render(<CardFront guild={GUILDS.ub} config={config} />)
    // Dimir = U + B
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná negro/i)).toBeInTheDocument()
  })

  it('renders the guest line when provided', () => {
    render(<CardFront guild={GUILDS.ub} config={config} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })
})
