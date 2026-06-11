/**
 * @jest-environment node
 */
import { POST } from '@/app/api/rsvp/route'
import { NextRequest } from 'next/server'

const mockInsert = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}))

beforeAll(() => {
  mockFrom.mockReturnValue({ insert: mockInsert })
})

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/rsvp', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/rsvp', () => {
  beforeEach(() => {
    mockInsert.mockResolvedValue({ error: null })
  })

  it('returns 201 for a valid request', async () => {
    const res = await POST(makeRequest({ guest_name: 'Alice', attending: true, message: 'Estaré ahí', colors: 'ub' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('returns 400 when guest_name is missing', async () => {
    const res = await POST(makeRequest({ attending: true }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when attending is missing', async () => {
    const res = await POST(makeRequest({ guest_name: 'Alice' }))
    expect(res.status).toBe(400)
  })

  it('returns 500 and surfaces the underlying error message when the insert fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockInsert.mockResolvedValueOnce({ error: { message: 'new row violates row-level security policy' } })
    const res = await POST(makeRequest({ guest_name: 'Alice', attending: false }))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('row-level security')
    spy.mockRestore()
  })

  it('returns 400 for malformed request body', async () => {
    const req = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: 'not json{',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('does not send a message field to the database', async () => {
    mockInsert.mockClear()
    await POST(makeRequest({ guest_name: 'Alice', attending: true, message: 'hola', colors: 'ub' }))
    expect(mockInsert.mock.calls[0][0]).not.toHaveProperty('message')
  })

  it('logs the underlying Supabase error when the insert fails', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockInsert.mockResolvedValueOnce({ error: { message: 'boom', code: '42501' } })
    await POST(makeRequest({ guest_name: 'Alice', attending: false }))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
