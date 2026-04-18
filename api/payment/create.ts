interface VercelRequest { method?: string; headers: Record<string, string | string[] | undefined>; body?: any }
interface VercelResponse { status(c: number): VercelResponse; json(b: any): VercelResponse; end(): VercelResponse }

import { getUserId, supabaseAdmin } from '../_lib/supabase-admin.js'
import { createPaymentPage } from '../_lib/grow.js'

const APP_URL = process.env.VITE_APP_URL ?? 'https://juline-nail-studio.vercel.app'

const PACKAGES: Record<string, { credits: number; priceNis: number; name: string }> = {
  starter: { credits: 5,  priceNis: 29, name: 'חבילת היכרות - 5 עיצובים' },
  studio:  { credits: 15, priceNis: 59, name: 'חבילת סטודיו - 15 עיצובים' },
  pro:     { credits: 35, priceNis: 99, name: 'חבילת פרו - 35 עיצובים' },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await getUserId(req.headers.authorization as string)
  if (!userId) return res.status(401).json({ error: 'נדרשת התחברות' })

  const { packageId } = req.body as { packageId: string }
  const pkg = PACKAGES[packageId]
  if (!pkg) return res.status(400).json({ error: 'חבילה לא קיימת' })

  const { data: txn } = await supabaseAdmin
    .from('jn_transactions')
    .insert({
      user_id: userId,
      type: 'purchase',
      credits_amount: pkg.credits,
      amount_agorot: pkg.priceNis * 100,
      status: 'pending',
    })
    .select('id')
    .single()

  try {
    const { paymentUrl } = await createPaymentPage(
      pkg.priceNis,
      pkg.name,
      `${APP_URL}/payment-success`,
      `${APP_URL}/payment-cancel`,
      `${APP_URL}/api/payment/webhook`,
      {
        cField1: userId,
        cField2: packageId,
        cField3: txn?.id ?? '',
      }
    )

    return res.status(200).json({ paymentUrl })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('Grow create error:', errMsg)
    return res.status(500).json({ error: errMsg })
  }
}
