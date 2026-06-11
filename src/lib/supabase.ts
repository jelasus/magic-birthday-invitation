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

  // A non-empty placeholder (e.g. "your_supabase_url_here") is not a valid URL,
  // so validate the format up front and fail with a clear, actionable message
  // instead of a cryptic client-construction error.
  if (!url || !key || !/^https?:\/\//.test(url)) {
    throw new Error(
      'Supabase no está configurado. Define SUPABASE_URL (https://tu-proyecto.supabase.co) y SUPABASE_ANON_KEY en el entorno.'
    )
  }

  client = createClient(url, key)
  return client
}
