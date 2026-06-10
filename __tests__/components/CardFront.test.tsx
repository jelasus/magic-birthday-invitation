import { render, screen } from '@testing-library/react'
import { CardFront } from '@/components/CardFront'
import type { CardIdentity } from '@/lib/cards'
import type { PartyConfig } from '@/lib/config'

const card: CardIdentity = {
  id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery',
  cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.',
}

const config: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'no-usado' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('CardFront', () => {
  it('renders the English title, type line and flavor', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByText('Happy Birthday')).toBeInTheDocument()
    expect(screen.getByText('Sorcery')).toBeInTheDocument()
    expect(screen.getByText(/Youth is a gift of nature/)).toBeInTheDocument()
  })

  it('renders the Spanish party details and age', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Sábado 1/)).toBeInTheDocument()
    expect(screen.getAllByText(/28/).length).toBeGreaterThan(0)
  })

  it('shows the art from the card', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art2.jpg')
  })

  it('renders the mana cost pips for the card', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.getByLabelText(/2 maná genérico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders the guest line when provided', () => {
    render(<CardFront card={card} config={config} guestName="Alice" />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('does not render a power/toughness badge', () => {
    render(<CardFront card={card} config={config} />)
    expect(screen.queryByText('28/∞')).not.toBeInTheDocument()
  })
})
