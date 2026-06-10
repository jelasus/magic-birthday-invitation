import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MtgCard } from '@/components/MtgCard'
import type { CardIdentity } from '@/lib/cards'
import type { PartyConfig } from '@/lib/config'

const card: CardIdentity = {
  id: 'wish', art: '/images/art/art2.jpg', title: 'Happy Birthday', typeLine: 'Sorcery',
  cost: [2, 'u'], colors: ['u'], flavor: 'Youth is a gift of nature; age, a work of art.',
}

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'no-usado' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
}

describe('MtgCard', () => {
  it('renders the card title and type', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByText('Happy Birthday')).toBeInTheDocument()
    expect(screen.getByText('Sorcery')).toBeInTheDocument()
  })

  it('renders party details and guest name', () => {
    render(<MtgCard card={card} config={mockConfig} guestName="Alice" />)
    expect(screen.getByText(/El Lugar/)).toBeInTheDocument()
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('shows the card art', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art2.jpg')
  })

  it('shows the Magic card back', () => {
    render(<MtgCard card={card} config={mockConfig} />)
    expect(screen.getByRole('img', { name: /reverso/i })).toBeInTheDocument()
  })

  it('flips when clicked', async () => {
    const user = userEvent.setup()
    render(<MtgCard card={card} config={mockConfig} />)
    const el = screen.getByRole('button', { name: /carta/i })
    expect(el).toHaveAttribute('aria-pressed', 'false')
    await user.click(el)
    expect(el).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Enter and is not a native button', async () => {
    const user = userEvent.setup()
    render(<MtgCard card={card} config={mockConfig} />)
    const el = screen.getByRole('button', { name: /carta/i })
    expect(el.tagName).not.toBe('BUTTON')
    el.focus()
    await user.keyboard('{Enter}')
    expect(el).toHaveAttribute('aria-pressed', 'true')
  })
})
