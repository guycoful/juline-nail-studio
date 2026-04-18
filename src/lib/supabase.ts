import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getAuthHeader(): Promise<string | undefined> {
  const session = await getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : undefined
}

export async function signOut() {
  await supabase.auth.signOut()
  window.location.href = '/'
}
