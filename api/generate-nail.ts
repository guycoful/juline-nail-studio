// Vercel provides these types at build time
interface VercelRequest { method?: string; headers: Record<string, string | string[] | undefined>; body?: any; }
interface VercelResponse { setHeader(k: string, v: string): VercelResponse; status(c: number): VercelResponse; json(b: any): VercelResponse; end(): VercelResponse; }

// --- Rate Limiting (in-memory, per serverless instance) ---

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

// --- Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for Vercel preview deployments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'יותר מדי בקשות. נסי שוב בעוד דקה.' });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error('XAI_API_KEY not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-image',
        prompt,
        n: 1,
        response_format: 'b64_json',
        size: '1024x1536',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('xAI API error:', response.status, errText);
      return res.status(502).json({ error: 'Image generation failed' });
    }

    const data = await response.json();
    const image = data.data?.[0]?.b64_json;

    if (!image) {
      console.error('No image in response:', JSON.stringify(data).slice(0, 300));
      return res.status(502).json({ error: 'No image generated' });
    }

    return res.status(200).json({
      image,
      mimeType: 'image/png',
    });
  } catch (err) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
