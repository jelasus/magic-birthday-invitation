import { render, screen } from '@testing-library/react'
import { ManaSymbol } from '@/components/ManaSymbol'

describe('ManaSymbol', () => {
  it('labels the pip by its mana color', () => {
    render(<ManaSymbol code="u" />)
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders an svg glyph', () => {
    const { container } = render(<ManaSymbol code="g" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
