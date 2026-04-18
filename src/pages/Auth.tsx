import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles } from 'lucide-react'

type Mode = 'login' | 'signup'

interface AuthPageProps {
  onSuccess?: () => void
  initialMode?: Mode
}

export default function AuthPage({ onSuccess, initialMode = 'signup' }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      if (onSuccess) {
        onSuccess()
      } else {
        window.location.href = '/pricing'
      }
    } catch (err: any) {
      const msg = err.message || 'שגיאה בהתחברות'
      if (msg.includes('already registered')) setError('כתובת אימייל כבר רשומה. תנסי להתחבר.')
      else if (msg.includes('Invalid login')) setError('אימייל או סיסמה שגויים')
      else if (msg.includes('Password should be')) setError('סיסמה צריכה להיות לפחות 6 תווים')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl border border-[#F0E0E2] shadow-xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-[#FFF0F2] rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#B76E79]" />
          </div>
          <h1 className="text-xl font-bold text-[#333]">Juline AI Nail Studio</h1>
          <p className="text-gray-500 text-sm">
            {mode === 'signup' ? 'צרי חשבון כדי להמשיך' : 'ברוכה השבה'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-[#FFF0F2] rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-white text-[#B76E79] shadow-sm' : 'text-gray-500'}`}
            onClick={() => { setMode('signup'); setError('') }}
          >
            הרשמה
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'login' ? 'bg-white text-[#B76E79] shadow-sm' : 'text-gray-500'}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            כניסה
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <input
              type="email"
              placeholder="כתובת אימייל"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#F0E0E2] focus:outline-none focus:border-[#B76E79] text-sm"
            />
            <input
              type="password"
              placeholder={mode === 'signup' ? 'סיסמה (לפחות 6 תווים)' : 'סיסמה'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-[#F0E0E2] focus:outline-none focus:border-[#B76E79] text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#A05D67] transition-colors disabled:opacity-60"
          >
            {loading ? 'רגע...' : mode === 'signup' ? 'צרי חשבון' : 'כניסה'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center">
          בהרשמה את מסכימה לתנאי השימוש
        </p>
      </div>
    </div>
  )
}
