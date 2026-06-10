import { render, screen } from '@testing-library/react'
import { MapEmbed } from '@/components/MapEmbed'

describe('MapEmbed', () => {
  it('renders an iframe with the provided URL', () => {
    render(<MapEmbed url="https://maps.google.com/embed?pb=test" />)
    const iframe = screen.getByTitle('Ubicación de la fiesta')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', 'https://maps.google.com/embed?pb=test')
  })
})
