import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client — bypasses RLS. Server-side only.
export const supabaseAdmin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Verify user JWT and return user id
export async function getUserId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user.id
}
