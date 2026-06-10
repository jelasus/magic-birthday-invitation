import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MtgCard } from '@/components/MtgCard'
import { GUILDS } from '@/lib/colors'
import type { PartyConfig } from '@/lib/config'

const mockConfig: PartyConfig = {
  birthday: { name: 'Brayan', age: 28, flavorText: 'Texto de ambientación.' },
  party: { date: 'Sábado 1', time: '19:00', venue: 'El Lugar', address: 'Calle 123', mapsEmbedUrl: 'https://maps.test' },
  card: { artImageUrl: '/images/cake-art.svg', setSymbol: '🎂' },
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

  it('shows the authentic Magic back', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    expect(screen.getByText(/Deckmaster/i)).toBeInTheDocument()
  })

  it('flips when clicked', async () => {
    const user = userEvent.setup()
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Enter key', async () => {
    const user = userEvent.setup()
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    card.focus()
    await user.keyboard('{Enter}')
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on Space key', async () => {
    const user = userEvent.setup()
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    card.focus()
    await user.keyboard(' ')
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  // The flip uses a CSS `preserve-3d` context. A native <button> wraps its
  // children in an anonymous block frame that flattens that context (see
  // Mozilla bug 1629011), so the interactive element must NOT be a <button>.
  it('uses a non-button element for the flip control to keep preserve-3d intact', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} />)
    const card = screen.getByRole('button', { name: /carta/i })
    expect(card.tagName).not.toBe('BUTTON')
  })

  it('passes artUrl through to the front face', () => {
    render(<MtgCard guild={GUILDS.ub} config={mockConfig} artUrl="/images/art/art3.jpg" />)
    expect(screen.getByTestId('card-art').style.backgroundImage).toContain('art3.jpg')
  })
})
