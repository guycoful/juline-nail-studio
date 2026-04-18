import { useState, useEffect } from 'react'
import { Sparkles, MessageCircle, Download, RefreshCw, X, ImageIcon, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NailDesign } from '@/data/juline-options'
import { buildPrompt, buildSummaryHe } from '@/data/juline-options'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { FREE_COUNT_KEY, MAX_FREE_DESIGNS } from '@/lib/constants'

interface AIPreviewProps {
  design: NailDesign
}

interface GalleryImage {
  id: string
  dataUrl: string
  date: string
}

const GALLERY_KEY = 'juline-ai-gallery'
const MAX_GALLERY = 10

function loadGallery(): GalleryImage[] {
  try { return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]') } catch { return [] }
}

function saveGallery(images: GalleryImage[]) {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(images.slice(0, MAX_GALLERY)))
  } catch {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(images.slice(0, 3)))
  }
}

function getFreeUsed(): number {
  return parseInt(localStorage.getItem(FREE_COUNT_KEY) || '0', 10)
}

function incrementFree() {
  localStorage.setItem(FREE_COUNT_KEY, String(getFreeUsed() + 1))
}

export default function AIPreview({ design }: AIPreviewProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [gallery, setGallery] = useState<GalleryImage[]>(loadGallery)
  const [showGallery, setShowGallery] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noCredits, setNoCredits] = useState(false)

  useEffect(() => { saveGallery(gallery) }, [gallery])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setNoCredits(false)

    try {
      const prompt = buildPrompt(design)

      // Get auth token if logged in
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const isLoggedIn = !!session?.access_token

      if (isLoggedIn) {
        headers['Authorization'] = `Bearer ${session!.access_token}`
      } else {
        // Free tier: check client-side limit
        const freeUsed = getFreeUsed()
        if (freeUsed >= MAX_FREE_DESIGNS) {
          window.location.reload() // Re-trigger DemoGate lock
          return
        }
      }

      const res = await fetch('/api/generate-nail', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt }),
      })

      if (res.status === 402) {
        setNoCredits(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate image')
      }

      const { image, mimeType } = await res.json()
      const dataUrl = `data:${mimeType};base64,${image}`
      setCurrentImage(dataUrl)

      // Track free usage
      if (!isLoggedIn) incrementFree()

      const entry: GalleryImage = {
        id: Date.now().toString(),
        dataUrl,
        date: new Date().toLocaleDateString('he-IL'),
      }
      setGallery(prev => [entry, ...prev].slice(0, MAX_GALLERY))
    } catch (err: any) {
      const msg = err.message || 'לא הצלחנו ליצור תמונה'
      setError(msg)
      toast({ title: 'שגיאה', description: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppShare = async () => {
    const summary = buildSummaryHe(design)
    const text = summary + '\n\n✨ הדמיה נוצרה ב-Juline AI Nail Studio'

    if (currentImage && navigator.share && navigator.canShare) {
      try {
        const res = await fetch(currentImage)
        const blob = await res.blob()
        const file = new File([blob], `juline-nail-${Date.now()}.jpg`, { type: 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ text, files: [file] })
          return
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleDownload = () => {
    if (!currentImage) return
    const link = document.createElement('a')
    link.href = currentImage
    link.download = `juline-nail-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: 'נשמר !', description: 'התמונה ירדה למכשיר' })
  }

  return (
    <div className="space-y-4">
      {/* No credits state */}
      {noCredits && (
        <div className="bg-[#FFF0F2] rounded-2xl border border-[#F0E0E2] p-6 text-center space-y-3">
          <p className="text-[#B76E79] font-semibold">נגמרו ההדמיות שלך</p>
          <p className="text-gray-500 text-sm">קני חבילה להמשיך ליצור עיצובים</p>
          <Button
            onClick={() => window.location.href = '/pricing'}
            className="bg-[#B76E79] hover:bg-[#A05D67] text-white gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            לחבילות
          </Button>
        </div>
      )}

      {/* Generate button */}
      {!loading && !currentImage && !noCredits && (
        <Button
          onClick={handleGenerate}
          disabled={!design.shape && !design.baseColor}
          className="w-full bg-gradient-to-l from-[#B76E79] via-[#C4929D] to-[#D4A3B0] hover:from-[#A05D67] hover:via-[#B37F8A] hover:to-[#C4929D] text-white gap-2 h-12 text-base font-semibold shadow-lg disabled:opacity-50"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          צרי לי הדמיה
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-[#F0E0E2] p-8 flex flex-col items-center gap-4 animate-pulse-glow">
          <div className="relative w-20 h-28">
            <svg viewBox="0 0 60 90" className="w-full h-full">
              <defs>
                <clipPath id="nail-load-clip">
                  <path d="M 0 90 L 0 30 C 0 10 10 0 30 0 C 50 0 60 10 60 30 L 60 90 Z" />
                </clipPath>
                <linearGradient id="nail-load-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#B76E79" />
                  <stop offset="100%" stopColor="#D4A3B0" />
                </linearGradient>
              </defs>
              <g clipPath="url(#nail-load-clip)">
                <rect x="0" y="0" width="60" height="90" fill="#F5E6E8" />
                <rect x="0" y="0" width="60" height="90" fill="url(#nail-load-grad)" className="animate-nail-fill" />
              </g>
              <path d="M 0 90 L 0 30 C 0 10 10 0 30 0 C 50 0 60 10 60 30 L 60 90 Z" fill="none" stroke="#D4A9B0" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[#B76E79] font-semibold">יוצרת הדמיה מקצועית...</p>
            <p className="text-gray-400 text-xs mt-1">זה לוקח 3-5 שניות</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && !currentImage && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center space-y-2">
          <p className="text-red-600 text-sm">{error}</p>
          <Button onClick={handleGenerate} variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
            נסי שוב
          </Button>
        </div>
      )}

      {/* Generated image */}
      {currentImage && !loading && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-[#F0E0E2] shadow-lg">
            <img src={currentImage} alt="AI nail design visualization" className="w-full aspect-[3/4] object-cover" />
            <div className="absolute top-2 left-2">
              <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full">
                ✨ AI Visualization
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleWhatsAppShare} className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white gap-2" size="lg">
              <MessageCircle className="w-5 h-5" />
              שלחי בוואטסאפ
            </Button>
            <Button onClick={handleDownload} variant="outline" className="border-[#B76E79] text-[#B76E79] hover:bg-[#FFF0F2]" size="lg" title="שמרי תמונה">
              <Download className="w-4 h-4" />
            </Button>
            <Button onClick={() => { setCurrentImage(null); handleGenerate() }} variant="outline" className="border-[#B76E79] text-[#B76E79] hover:bg-[#FFF0F2]" size="lg" title="צרי עוד אחת">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="flex items-center gap-2 text-sm text-[#B76E79] font-medium hover:text-[#8B4D57] transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            הדמיות קודמות ({gallery.length})
            <svg className={`w-3 h-3 transition-transform duration-200 ${showGallery ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGallery && (
            <div className="grid grid-cols-3 gap-2">
              {gallery.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#F0E0E2] cursor-pointer" onClick={() => setCurrentImage(img.dataUrl)}>
                  <img src={img.dataUrl} alt="Previous design" className="w-full aspect-[3/4] object-cover transition-transform group-hover:scale-105" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setGallery(prev => prev.filter(g => g.id !== img.id)) }}
                    className="absolute top-1 left-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 right-1 text-[8px] text-white bg-black/40 px-1 rounded">{img.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
