import { supabaseAdmin } from './supabase-admin.js'

// Atomically deduct 1 credit. Returns true if successful.
export async function deductCredit(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('deduct_jn_credit', { p_user_id: userId })
  if (error) return false
  return data === true
}

// Add credits after payment
export async function addCredits(userId: string, amount: number): Promise<void> {
  await supabaseAdmin.rpc('add_jn_credits', { p_user_id: userId, p_amount: amount })
}
