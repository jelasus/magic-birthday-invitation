import { render, screen } from '@testing-library/react'
import { CardBack } from '@/components/CardBack'

describe('CardBack', () => {
  it('renders the Magic card back image', () => {
    render(<CardBack />)
    const back = screen.getByRole('img', { name: /reverso/i })
    expect(back).toBeInTheDocument()
    expect(back.style.backgroundImage).toContain('card-back.jpg')
  })
})
