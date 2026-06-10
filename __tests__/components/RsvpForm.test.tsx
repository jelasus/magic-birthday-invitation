import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RsvpForm } from '@/components/RsvpForm'

global.fetch = jest.fn()

function mockFetchSuccess() {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true }),
  })
}

function mockFetchError() {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'Ocurrió un error. Por favor intenta de nuevo.' }),
  })
}

describe('RsvpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('pre-fills the guest name from props', () => {
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
  })

  it('does not render a message field', () => {
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    expect(screen.queryByLabelText(/Mensaje/i)).not.toBeInTheDocument()
  })

  it('submit button is disabled when attending is not selected', () => {
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    expect(screen.getByRole('button', { name: /Confirmar asistencia/ })).toBeDisabled()
  })

  it('submit button is enabled after selecting attending', async () => {
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    expect(screen.getByRole('button', { name: /Confirmar asistencia/ })).not.toBeDisabled()
  })

  it('shows success message after successful submission', async () => {
    mockFetchSuccess()
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar asistencia/ }))
    await waitFor(() =>
      expect(screen.getByText(/Tu respuesta ha sido registrada/)).toBeInTheDocument()
    )
  })

  it('shows error message after failed submission', async () => {
    mockFetchError()
    const user = userEvent.setup()
    render(<RsvpForm guestName="Alice" guildCode="ub" />)
    await user.click(screen.getByRole('button', { name: /Sí, asistiré/ }))
    await user.click(screen.getByRole('button', { name: /Confirmar asistencia/ }))
    await waitFor(() =>
      expect(screen.getByText(/Ocurrió un error/)).toBeInTheDocument()
    )
  })
})
