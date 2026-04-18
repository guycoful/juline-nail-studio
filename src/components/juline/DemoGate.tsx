import { useState, useEffect } from 'react'
import { Sparkles, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MAX_FREE_DESIGNS, FREE_COUNT_KEY } from '@/lib/constants'

function getFreeCount(): number {
  return parseInt(localStorage.getItem(FREE_COUNT_KEY) || '0', 10)
}

function isAdminOrBypass(): boolean {
  if (localStorage.getItem('juline-admin') === 'true') return true
  const params = new URLSearchParams(window.location.search)
  return params.get('key') === 'juline2026'
}

interface DemoGateProps {
  children: React.ReactNode
}

export default function DemoGate({ children }: DemoGateProps) {
  const [state, setState] = useState<'loading' | 'free' | 'paid' | 'locked'>('loading')
  const [freeLeft, setFreeLeft] = useState(MAX_FREE_DESIGNS)

  useEffect(() => {
    async function check() {
      if (isAdminOrBypass()) { setState('paid'); return }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) { setState('paid'); return }

      const used = getFreeCount()
      const left = Math.max(0, MAX_FREE_DESIGNS - used)
      setFreeLeft(left)
      setState(left > 0 ? 'free' : 'locked')
    }
    check()
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'locked') {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-6" dir="rtl">
        <div className="bg-white rounded-3xl border border-[#F0E0E2] shadow-2xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-[#FFF0F2] rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#B76E79]" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#333]">ניצלת את ההדמיות החינמיות</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              כדי להמשיך ליצור הדמיות AI מקצועיות, צרי חשבון וקני חבילה
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/signup'}
              className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#A05D67] transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              הרשמה וקניית חבילה
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 bg-[#FFF0F2] text-[#B76E79] rounded-xl font-semibold hover:bg-[#FFE5E8] transition-colors"
            >
              יש לי חשבון - כניסה
            </button>
          </div>

          <p className="text-xs text-gray-400">החל מ-₪29 בלבד</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Free designs counter badge */}
      {state === 'free' && (
        <div className="fixed bottom-4 left-4 z-[90]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg text-sm font-medium bg-white/90 backdrop-blur-sm border border-[#F0E0E2] text-[#B76E79]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{freeLeft} הדמיות חינם</span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export function decrementFreeCount() {
  const used = getFreeCount()
  localStorage.setItem(FREE_COUNT_KEY, String(used + 1))
}

export function isFreeUser(): boolean {
  return !isAdminOrBypass()
}
