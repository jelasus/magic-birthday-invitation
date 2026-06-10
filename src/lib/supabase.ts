import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Lazily creates the Supabase client on first use. Building the client at
 * request time (rather than module load) keeps the Next.js build from crashing
 * when env vars aren't present during static analysis. Throws if the required
 * env vars are missing so the caller can surface a 503.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables.')
  }

  client = createClient(url, key)
  return client
}
