import { useState, useEffect } from 'react'
import { Sparkles, Check, LogOut } from 'lucide-react'
import { CREDIT_PACKAGES } from '@/lib/constants'
import { supabase, signOut } from '@/lib/supabase'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.href = '/login'; return }
      setEmail(session.user.email ?? null)

      supabase
        .from('jn_profiles')
        .select('credits_balance')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          setCredits(data?.credits_balance ?? 0)
        })
    })
  }, [])

  const handleBuy = async (packageId: string) => {
    setLoading(packageId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאה ביצירת תשלום')

      window.location.href = data.paymentUrl
    } catch (err: any) {
      alert(err.message || 'שגיאה, נסי שוב')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] p-4" dir="rtl">
      <div className="max-w-md mx-auto space-y-6 pt-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-[#FFF0F2] rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#B76E79]" />
          </div>
          <h1 className="text-2xl font-bold text-[#333]">בחרי חבילה</h1>
          {email && <p className="text-sm text-gray-500">{email}</p>}
          {credits !== null && credits > 0 && (
            <p className="text-sm text-[#B76E79] font-medium">נותרו לך {credits} הדמיות</p>
          )}
        </div>

        {/* Packages */}
        <div className="space-y-3">
          {CREDIT_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl border-2 p-5 ${
                pkg.popular ? 'border-[#B76E79] shadow-lg' : 'border-[#F0E0E2]'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 right-4 bg-[#B76E79] text-white text-xs px-3 py-1 rounded-full font-medium">
                  הכי פופולרי
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#333] text-lg">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">{pkg.credits} הדמיות AI</p>
                  <p className="text-gray-400 text-xs mt-1">{pkg.perCredit}</p>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-bold text-[#B76E79]">{pkg.priceFormatted}</span>
                  <p className="text-gray-400 text-xs">חד פעמי</p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#B76E79] shrink-0" />
                  <span>הדמיות AI מקצועיות</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#B76E79] shrink-0" />
                  <span>שיתוף ישיר לוואטסאפ</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#B76E79] shrink-0" />
                  <span>תקפות ללא הגבלת זמן</span>
                </div>
              </div>

              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={loading !== null}
                className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${
                  pkg.popular
                    ? 'bg-[#B76E79] text-white hover:bg-[#A05D67]'
                    : 'bg-[#FFF0F2] text-[#B76E79] hover:bg-[#FFE5E8]'
                }`}
              >
                {loading === pkg.id ? 'מעבירה לתשלום...' : `קני ${pkg.priceFormatted}`}
              </button>
            </div>
          ))}
        </div>

        {/* Back + logout */}
        <div className="flex flex-col gap-2 text-center">
          {credits !== null && credits > 0 && (
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-[#B76E79] hover:underline"
            >
              חזרה לאפליקציה
            </button>
          )}
          <button
            onClick={signOut}
            className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600 mx-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            יציאה
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center pb-8">
          תשלום מאובטח דרך Grow (Meshulam)
        </p>
      </div>
    </div>
  )
}
