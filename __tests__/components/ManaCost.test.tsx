import { render, screen } from '@testing-library/react'
import { ManaCost } from '@/components/ManaCost'

describe('ManaCost', () => {
  it('renders a generic numeric pip and colored pips in order', () => {
    render(<ManaCost cost={[2, 'u']} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByLabelText(/2 maná genérico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná azul/i)).toBeInTheDocument()
  })

  it('renders five colored pips for a 5-color cost', () => {
    render(<ManaCost cost={['w', 'u', 'b', 'r', 'g']} />)
    expect(screen.getByLabelText(/maná blanco/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maná verde/i)).toBeInTheDocument()
  })
})
