import { render, screen } from '@testing-library/react'
import { MtgCard } from '@/components/MtgCard'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/card-art.svg', setSymbol: '🎂' },
}

describe('MtgCard', () => {
  it('renders the birthday person name', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getAllByText(/Brayan/).length).toBeGreaterThan(0)
  })

  it('renders the age', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getAllByText(/28/).length).toBeGreaterThan(0)
  })

  it('renders party date, time, and venue', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Sábado 1/)).toBeInTheDocument()
    expect(screen.getByText(/19:00/)).toBeInTheDocument()
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
  })

  it('renders flavor text', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Texto de ambientación/)).toBeInTheDocument()
  })

  it('renders guest name when provided', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('does not render guest name section when omitted', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.queryByText(/Invitado especial/)).not.toBeInTheDocument()
  })

  it('renders the Spanish type line', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Conjuro Legendario/)).toBeInTheDocument()
  })

  it('renders power/toughness with age', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText('28/∞')).toBeInTheDocument()
  })
})
