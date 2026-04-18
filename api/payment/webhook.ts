interface VercelRequest { method?: string; headers: Record<string, string | string[] | undefined>; body?: any }
interface VercelResponse { status(c: number): VercelResponse; json(b: any): VercelResponse; end(): VercelResponse }

import { supabaseAdmin } from '../_lib/supabase-admin.js'
import { addCredits } from '../_lib/credits.js'
import { approveTransaction } from '../_lib/grow.js'

const PACKAGES: Record<string, number> = {
  starter: 5,
  studio: 15,
  pro: 35,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body as Record<string, string>

  const transactionId = body.transactionId ?? body.transaction_id
  const paymentSum = Number(body.paymentSum ?? body.sum ?? 0)
  const userId = body.cField1
  const packageId = body.cField2
  const txnRowId = body.cField3

  if (!transactionId || !userId || !packageId) {
    console.error('Webhook missing fields:', body)
    return res.status(200).end()
  }

  // Idempotency: skip if already processed
  const { data: existing } = await supabaseAdmin
    .from('jn_transactions')
    .select('id, status')
    .eq('grow_transaction_id', transactionId)
    .single()

  if (existing?.status === 'completed') {
    return res.status(200).end()
  }

  try {
    await approveTransaction(transactionId, paymentSum)

    const credits = PACKAGES[packageId] ?? 0
    await addCredits(userId, credits)

    if (txnRowId) {
      await supabaseAdmin
        .from('jn_transactions')
        .update({ status: 'completed', grow_transaction_id: transactionId, metadata: body })
        .eq('id', txnRowId)
    } else {
      await supabaseAdmin.from('jn_transactions').insert({
        user_id: userId,
        type: 'purchase',
        credits_amount: credits,
        amount_agorot: paymentSum * 100,
        status: 'completed',
        grow_transaction_id: transactionId,
        metadata: body,
      })
    }

    console.log(`✅ Payment: ${credits} credits → user ${userId}`)
  } catch (err) {
    console.error('Webhook error:', err)
  }

  return res.status(200).end()
}
