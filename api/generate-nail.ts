import { getUserId } from './_lib/supabase-admin.js'
import { deductCredit, addCredits } from './_lib/credits.js'

interface VercelRequest { method?: string; headers: Record<string, string | string[] | undefined>; body?: any }
interface VercelResponse { setHeader(k: string, v: string): VercelResponse; status(c: number): VercelResponse; json(b: any): VercelResponse; end(): VercelResponse }

// In-memory rate limiting (free tier protection, per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt } = req.body || {}
  if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
    return res.status(400).json({ error: 'Missing or invalid prompt' })
  }

  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  // Auth check: logged-in users use credits, free tier is IP-rate-limited
  const authHeader = req.headers['authorization'] as string | undefined
  let userId: string | null = null
  let usedCredit = false

  if (authHeader) {
    userId = await getUserId(authHeader)
    if (!userId) return res.status(401).json({ error: 'אימות נכשל' })

    const deducted = await deductCredit(userId)
    if (!deducted) {
      return res.status(402).json({ error: 'אין הדמיות. קני חבילה.' })
    }
    usedCredit = true
  } else {
    // Free tier: IP rate limiting
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'יותר מדי בקשות. נסי שוב בעוד דקה.' })
    }
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-imagine-image-pro',
        prompt,
        n: 1,
        response_format: 'b64_json',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('xAI API error:', response.status, errText)
      // Refund credit on failure
      if (usedCredit && userId) await addCredits(userId, 1)
      return res.status(502).json({ error: 'Image generation failed' })
    }

    const data = await response.json()
    const image = data.data?.[0]?.b64_json

    if (!image) {
      if (usedCredit && userId) await addCredits(userId, 1)
      return res.status(502).json({ error: 'No image generated' })
    }

    return res.status(200).json({ image, mimeType: 'image/jpeg' })
  } catch (err) {
    console.error('Generation error:', err)
    if (usedCredit && userId) await addCredits(userId, 1)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
