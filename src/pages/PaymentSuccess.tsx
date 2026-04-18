import { useEffect, useState } from 'react'
import { CheckCircle, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function PaymentSuccessPage() {
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    // Wait a moment for webhook to process, then show updated credits
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('jn_profiles')
        .select('credits_balance')
        .eq('id', session.user.id)
        .single()

      setCredits(data?.credits_balance ?? null)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl border border-[#F0E0E2] shadow-xl p-8 max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#333]">התשלום התקבל</h2>
          <p className="text-gray-500 mt-2 text-sm">
            ההדמיות נוספו לחשבון שלך
          </p>
          {credits !== null && (
            <p className="text-[#B76E79] font-semibold mt-2">
              יש לך {credits} הדמיות
            </p>
          )}
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#A05D67] transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          קדימה ליצור עיצובים
        </button>
      </div>
    </div>
  )
}
