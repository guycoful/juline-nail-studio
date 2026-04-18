// Grow (Meshulam) Light API wrapper
// CRITICAL: multipart/form-data only, server-side only

const GROW_BASE = 'https://api.meshulam.co.il'

interface CreatePaymentResult {
  paymentUrl: string
  processId: string
}

export async function createPaymentPage(
  sumNis: number,
  description: string,
  successUrl: string,
  cancelUrl: string,
  webhookUrl: string,
  customFields: Record<string, string>
): Promise<CreatePaymentResult> {
  const pageCode = process.env.GROW_PAGE_ID
  const userId = process.env.GROW_USER_ID

  if (!pageCode || !userId) {
    throw new Error(`Grow credentials missing: pageCode=${!!pageCode}, userId=${!!userId}`)
  }

  const form = new URLSearchParams()
  form.set('pageCode', pageCode.trim())
  form.set('userId', userId.trim())
  form.set('sum', String(sumNis))
  form.set('description', description)
  form.set('successUrl', successUrl)
  form.set('cancelUrl', cancelUrl)
  form.set('notifyUrl', webhookUrl)
  form.set('paymentNum', '1')
  form.set('pageField[fullName]', 'Juline Customer')
  form.set('pageField[phone]', '0500000000')

  Object.entries(customFields).forEach(([key, val]) => {
    form.set(key, val)
  })

  const res = await fetch(`${GROW_BASE}/api/light/server/1.0/createPaymentProcess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  const data = await res.json()

  if ((data.status === 0 && data.err) || !data.data?.url) {
    throw new Error(`Grow rejected: ${JSON.stringify(data.err ?? data)}`)
  }

  return {
    paymentUrl: data.data.url,
    processId: data.data.processId ?? '',
  }
}

export async function approveTransaction(transactionId: string, _sum: number): Promise<void> {
  const pageCode = process.env.GROW_PAGE_ID
  if (!pageCode) return

  const form = new URLSearchParams()
  form.set('pageCode', pageCode.trim())
  form.set('transactionId', transactionId)

  await fetch(`${GROW_BASE}/api/light/server/1.0/approveTransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
}
