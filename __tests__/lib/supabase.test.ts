/**
 * @jest-environment node
 */

describe('getSupabaseClient', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  it('throws a clear "configurado" error when the url is a placeholder', async () => {
    process.env.SUPABASE_URL = 'your_supabase_url_here'
    process.env.SUPABASE_ANON_KEY = 'some-key'
    const { getSupabaseClient } = await import('@/lib/supabase')
    expect(() => getSupabaseClient()).toThrow(/configurad/i)
  })

  it('throws a clear "configurado" error when the anon key is missing', async () => {
    process.env.SUPABASE_URL = 'https://abc.supabase.co'
    delete process.env.SUPABASE_ANON_KEY
    const { getSupabaseClient } = await import('@/lib/supabase')
    expect(() => getSupabaseClient()).toThrow(/configurad/i)
  })

  it('returns a client for a valid https url + key', async () => {
    process.env.SUPABASE_URL = 'https://abc.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'anon-key-123'
    const { getSupabaseClient } = await import('@/lib/supabase')
    const client = getSupabaseClient()
    expect(client).toBeTruthy()
    expect(typeof client.from).toBe('function')
  })
})
