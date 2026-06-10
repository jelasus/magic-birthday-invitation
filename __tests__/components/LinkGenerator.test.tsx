import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkGenerator } from '@/components/LinkGenerator'
import { pickCard } from '@/lib/cards'

describe('LinkGenerator', () => {
  it('generates a guest link (no colors param) and previews the deterministic card title', async () => {
    const user = userEvent.setup()
    render(<LinkGenerator />)
    await user.type(screen.getByPlaceholderText(/Nombre del invitado/i), 'Alice')
    await user.click(screen.getByRole('button', { name: /Generar/i }))

    const field = screen.getByDisplayValue(/\/invite\?guest=Alice/)
    expect(field).toBeInTheDocument()
    expect((field as HTMLInputElement).value).not.toContain('colors=')
    expect(screen.getByText(pickCard('Alice').title)).toBeInTheDocument()
  })
})
