import { render, screen } from '@testing-library/react'
import { CardBack } from '@/components/CardBack'

describe('CardBack', () => {
  it('shows the Magic wordmark', () => {
    render(<CardBack />)
    expect(screen.getByText(/Magic: The Gathering/i)).toBeInTheDocument()
  })

  it('shows the Deckmaster brand', () => {
    render(<CardBack />)
    expect(screen.getByText(/Deckmaster/i)).toBeInTheDocument()
  })

  it('renders all five mana colors in the wheel', () => {
    render(<CardBack />)
    expect(screen.getByLabelText(/maná blanco/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná negro/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná rojo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná verde/i)).toBeInTheDocument()
  })
})
